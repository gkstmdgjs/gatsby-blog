---
emoji: 🌐
title: 'WebSocket 서버 확장하기'
date: '2026-05-10'
categories: Dev Backend Server
---

회사에서 실시간 알림 시스템을 운영하던 어느 날, QA 채널에 이상한 리포트가 올라왔어요. 🤯

> *"두 대 중 한 서버에 붙은 사람들만 알림이 안 와요. 새로고침하면 보이긴 하는데..."*

처음엔 *"네트워크 일시 장애겠지"* 정도로 흘려 들었어요. 근데 다음 날에도, 그 다음 날에도 같은 패턴의 리포트가 올라왔습니다. 결국 본인이 직접 트레이싱을 해보고 나서야 깨달았죠. **진짜 버그였습니다.** 🥶

> "어... 이거 분명 서버 한 대일 땐 잘 되던 코드인데?"  
> "트래픽 늘어서 컨테이너 한 대만 늘렸을 뿐인데 왜?"  
> "WebSocket이 메모리에 세션을 쥐고 있다는 얘긴 들었는데, 그게 이거였나?"

이번 글은 그 트러블슈팅 후기예요. 5년차 백엔드 개발자라면 한 번쯤은 마주치는 *"수평 확장(scale-out)할 때의 첫 번째 함정"* 이거든요. 🎯

&nbsp;

## 📌 왜 두 대로 늘리니 깨졌나?

원인을 한 줄로 정리하면 이렇습니다.

> **"WebSocket 연결은 메모리에 박혀있어서, 다른 서버에 붙은 사람한테는 메시지가 안 간다."**

처음 짠 알림 게이트웨이는 이런 식이었어요.

```typescript
// 단일 서버 가정 — 자기 메모리에 있는 클라이언트에게만 보냄
@WebSocketGateway()
export class NotifyGateway {
  @WebSocketServer() server!: Server;

  broadcastNew(notification: Notification) {
    this.server.emit('new-notification', notification);
  }
}
```

이건 **자기 서버의 메모리에 등록된 클라이언트**에게만 메시지를 보냅니다. 그림으로 보면!

```text
            ┌─────────────────┐
   nginx ──▶│  서버 A (8080)   │  ← 사용자 1, 2, 3 접속
            │  메모리: [1,2,3] │
            └─────────────────┘
            ┌─────────────────┐
            │  서버 B (8081)   │  ← 사용자 4, 5 접속
            │  메모리: [4,5]   │
            └─────────────────┘
```

알림 발생이 **서버 B에서 일어나면 서버 B의 메모리 [4,5]에게만** 전달됩니다. **서버 A에 붙은 [1,2,3]은 영원히 모릅니다.** 😢

이게 진짜 문제였어요. 사용자가 **이번엔 어떤 서버에 붙느냐에 따라 알림을 받을 수도, 못 받을 수도 있다.** 7-8년차 백엔드 시니어라면 *"수평 확장(scale-out)할 때 마주치는 가장 흔한 함정"* 으로 외워두는 영역이에요.

&nbsp;

## 🧠 핵심 발상 — 서버끼리 메시지를 주고받게 하자

해결의 방향은 자명합니다.

> **"서버 B에서 일어난 일을 서버 A도 알아야 한다. 그 사이에 메시지 통로(broker)를 둔다."**

```text
            ┌─────────────────┐
   nginx ──▶│  서버 A          │ ←─────┐
            └─────────────────┘       │
                                      │
            ┌─────────────────┐    ┌──▼────┐
            │  서버 B          │ ──▶│ Redis │
            └─────────────────┘    └───────┘
                                      │
            ┌─────────────────┐       │
            │  서버 C (앞으로)  │ ←─────┘
            └─────────────────┘
```

서버 B에서 알림이 발생하면 **Redis에 publish**, 모든 서버는 같은 채널을 **subscribe**. 서버 A도, 서버 C도 그 메시지를 받아서 자기 메모리의 클라이언트들에게 그대로 전달합니다.

다행히 회사 프로젝트엔 **이미 캐싱용으로 깔려있던 Redis** 가 있었어요. 한 인프라가 두 가지 일을 해주니까 가성비가 좋아요. 인프라를 새로 추가하지 않고 풀 수 있다는 점에서 PM/PO 설득도 쉬웠습니다. 💸

&nbsp;

## 🛠️ 1차 구현 — Redis Pub/Sub으로 살리기

NestJS 기준으로 짜봤어요!

```typescript
// redis-broker.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RedisBrokerService implements OnModuleInit {
  private readonly serverId = randomUUID(); // 서버 식별자
  private publisher!: Redis;
  private subscriber!: Redis;

  // 채널별 콜백 등록
  private handlers = new Map<string, (data: unknown) => void>();

  async onModuleInit() {
    this.publisher = new Redis(process.env.REDIS_URL!);
    this.subscriber = new Redis(process.env.REDIS_URL!);

    this.subscriber.on('message', (channel, raw) => {
      const handler = this.handlers.get(channel);
      if (handler) handler(JSON.parse(raw));
    });
  }

  async publish(channel: string, payload: unknown) {
    await this.publisher.publish(
      channel,
      JSON.stringify({ from: this.serverId, payload }),
    );
  }

  async subscribe(channel: string, handler: (msg: any) => void) {
    this.handlers.set(channel, handler);
    await this.subscriber.subscribe(channel);
  }
}
```

🚨 **중요한 함정 하나** — Redis 클라이언트는 **subscribe 모드에 들어가면 다른 명령어를 못 씁니다.** 그래서 publisher용/subscriber용 **연결을 따로** 가져야 해요. 같은 인스턴스로 둘 다 하면 *"왜 publish가 안 되지?"* 에서 막힙니다. 5년차도 한 번씩 만나는 함정. 💡

이제 알림 게이트웨이에 끼워넣어요!

```typescript
// notify.gateway.ts
@WebSocketGateway({ namespace: 'notify' })
export class NotifyGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;

  constructor(private broker: RedisBrokerService) {}

  async afterInit() {
    // 다른 서버가 보낸 알림을 받아서, 내 서버의 클라이언트들에게 전파
    await this.broker.subscribe('notify:new', ({ payload }) => {
      this.server.emit('new-notification', payload);
    });
  }

  // 비즈니스 로직에서 알림이 발생하면 호출
  async broadcastNew(notification: Notification) {
    // 1. 자기 서버 클라이언트에게 즉시 전송
    this.server.emit('new-notification', notification);

    // 2. Redis에도 publish → 다른 서버들도 받음
    await this.broker.publish('notify:new', notification);
  }
}
```

이걸 띄우고 **서버를 두 대 굴려본 결과**!

```text
[서버 A] 사용자 1 접속
[서버 B] 사용자 4 접속
[서버 B] 알림 발생
[서버 B] publish 'notify:new' to Redis
[서버 A] received 'notify:new' from Redis ✨
[서버 A] 사용자 1에게 알림 전송
```

QA 리포트의 그 버그가 깔끔하게 사라졌어요! 🎉  
*"이제 진짜 끝났네?"* 라는 자만이 들었지만... 또 다음 단계에서 정확히 한 방에 깨졌습니다. 😅

&nbsp;

## 😱 첫 번째 시련 — 메시지가 자기 자신한테도 돌아온다

위 코드를 잘 보면 미묘한 버그가 있어요. 서버 B가 알림을 처리하면:

1. 자기 서버 클라이언트에게 `emit` (즉시 전송)
2. Redis에 publish

근데 Redis는 **publish한 본인도 subscribe하고 있으면** 메시지를 그대로 다시 던져줍니다. 그러면 서버 B는:

3. Redis에서 `notify:new` 받음
4. 자기 클라이언트에게 또 `emit`

→ 서버 B의 사용자들은 **같은 알림을 두 번 받게** 됩니다. 🥶 *"왜 알림이 두 번 와요?"* 라는 새로운 QA 리포트가 시작되는 거죠.

```text
[서버 B] 알림 발생 → 즉시 emit (1번째)
[서버 B] publish → Redis ─┐
[서버 B] subscribe ◀──────┘
[서버 B] 또 emit (2번째)  ← 중복!
```

해법은 메시지에 **`from: serverId`** 를 박아두고, 자기가 보낸 거면 무시하는 거예요.

```typescript
async subscribe(channel: string, handler: (msg: any) => void) {
  this.handlers.set(channel, (data: any) => {
    if (data.from === this.serverId) return; // 자기가 보낸 건 무시!
    handler(data.payload);
  });
  await this.subscriber.subscribe(channel);
}
```

위 publish 함수에서 이미 `from: this.serverId` 를 박아둔 게 여기서 빛을 발하죠. 7년차스럽게 미리 박아둔 게 칭찬받을 부분이에요. 😎

&nbsp;

## 😱 두 번째 시련 — Pub/Sub은 메시지를 보장하지 않는다

여기까지 와서 *"이제 진짜 됐다!"* 싶었는데, 며칠 뒤 또 다른 리포트가 올라왔어요.

> *"배포 직후 잠깐 동안 알림이 누락된 것 같아요. 그 시간대에 발생한 알림이 안 보여요."*

원인은 **Redis Pub/Sub의 가장 큰 한계**예요.

> **"발행 시점에 구독자가 없으면, 메시지는 그냥 사라진다. (fire-and-forget)"**

배포 시점에 한 서버가 막 시작되는 순간(subscribe 등록 직전)에 다른 서버에서 publish가 일어나면, **그 메시지는 누구한테도 안 가고 증발합니다.** 🚨

| 분류 | 메시지 보장 | 순서 보장 | 다중 구독자 |
|------|-----------|----------|-----------|
| **Pub/Sub** | ❌ 없음 | ❌ 없음 | ✅ 가능 |
| **Streams** | ✅ 있음 (XADD/XREAD) | ✅ 있음 | ✅ 가능 (Consumer Groups) |
| **Lists** | ✅ 있음 (LPUSH/BRPOP) | ✅ 있음 | ❌ 한 명만 받음 |

Pub/Sub은 *"실시간 알림"* 에는 좋지만 *"절대 잃으면 안 되는 메시지"* 에는 부적합해요. 7-8년차 인프라 시니어라면 이 표를 즉시 떠올려야 합니다.

해법은 두 가지!

&nbsp;

## 🪜 해법 1 — Redis Streams로 메시지 영속화

Redis 5.0부터 추가된 [Streams](https://redis.io/docs/latest/develop/data-types/streams/) 는 Kafka 흉내 자료구조예요. 메시지가 **로그처럼 영속화**되고, 시간 범위로 다시 읽을 수 있습니다.

```typescript
async publishStream(stream: string, payload: unknown) {
  await this.publisher.xadd(
    stream,
    'MAXLEN', '~', 10000,    // 최근 1만 개만 보관 (자동 정리)
    '*',                     // ID 자동 생성
    'data', JSON.stringify({ from: this.serverId, payload }),
  );
}

async consumeStream(stream: string, group: string, handler: (msg: any) => void) {
  // 최초 1번 컨슈머 그룹 생성 (이미 있으면 무시)
  try {
    await this.subscriber.xgroup('CREATE', stream, group, '$', 'MKSTREAM');
  } catch (e: any) {
    if (!e.message.includes('BUSYGROUP')) throw e;
  }

  // 무한 루프로 읽기
  while (true) {
    const result = await this.subscriber.xreadgroup(
      'GROUP', group, this.serverId,
      'COUNT', 10,
      'BLOCK', 5000,         // 5초 대기 (롱 폴링)
      'STREAMS', stream, '>', // '>' = 아직 안 읽은 것만
    );
    if (!result) continue;

    for (const [, messages] of result as any) {
      for (const [id, fields] of messages) {
        const data = JSON.parse(fields[1]);
        if (data.from !== this.serverId) handler(data.payload);
        await this.subscriber.xack(stream, group, id); // 처리 완료 ack
      }
    }
  }
}
```

핵심 포인트만 짚으면!

- 📜 **`MAXLEN ~ 10000`** — 최근 1만 개만 보관. 메모리 폭주 방지. `~` 는 *"대략"* 이라는 뜻으로 성능 최적화.
- 👥 **Consumer Group** — Kafka의 그것. 여러 서버가 같은 그룹에 속하면 **메시지를 분산해서 처리**. 같은 그룹이면 한 메시지는 한 서버만 처리.
- ✅ **`xack`** — *"이 메시지 처리 완료"* 표시. 안 하면 PEL(Pending Entries List)에 남아서 재처리 가능.
- ⏱️ **`BLOCK 5000`** — 메시지 없으면 최대 5초 대기. 폴링 부하 ↓.

같은 그룹의 다른 서버가 죽어도, 새 서버가 같은 그룹으로 붙으면 **PEL에 남은 메시지를 이어받을 수 있어요.** 단순 알림 같은 *"잃어도 되는 메시지"* 에는 과한 도구지만, *"결제 이벤트"* 같은 영역에선 거의 필수예요.

&nbsp;

## 🪜 해법 2 — socket.io-redis-adapter (가장 현실적)

위에서 손으로 짠 게 학습용으론 좋지만, **실무에선 검증된 어댑터**를 쓰는 게 답이에요. socket.io를 쓴다면 [socket.io-redis-adapter](https://socket.io/docs/v4/redis-adapter/) 가 정확히 이 일을 해줍니다.

```typescript
// main.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

세 줄로 끝나요. 이걸 깔면 `io.emit()`, `socket.broadcast.emit()` 등 모든 socket.io API가 **자동으로 Redis를 통해 다중 서버에 전파**됩니다. 자기 서버 메시지 중복 문제까지 알아서 처리해줘요. ✨

| 분류 | 직접 구현 | socket.io-redis-adapter |
|------|---------|------------------------|
| 학습 | ✅ 깊이 이해 | ❌ 블랙박스 |
| 실무 | ❌ 함정 많음 | ✅ 검증된 코드 |
| 코드 양 | 100~200줄 | 3줄 |
| 메시지 보장 | 직접 짜야 | Redis Pub/Sub 기반 (보장 X) |

> 7-8년차 시니어 관점에서 권하는 답: **"개념은 손으로 한 번 만들어보고, 프로덕션은 검증된 어댑터를 쓰자."** 이 글이 그 *"한 번 만들어보기"* 의 역할입니다. 🎯

&nbsp;

## 😱 세 번째 시련 — Sticky Session 함정

여기까지 풀고 *"진짜 끝!"* 인 줄 알았는데 또 한 가지 발견했어요. 7년차도 가끔 까먹는 함정이에요.

WebSocket이 처음 연결될 때 **HTTP 핸드셰이크 → Upgrade**를 거쳐요. socket.io는 이 과정에서 *"먼저 long-polling 시도 → 성공 시 WebSocket으로 업그레이드"* 같은 fallback도 있는데, **이 두 요청이 다른 서버로 가면 에러납니다.** 🥶

nginx 라운드로빈 + WebSocket = **연결 자체가 안 맺어지는 사태**. 콘솔에 *"Session ID unknown"* 뜨면 거의 이거예요. 회사 프로젝트에서도 처음 두 대로 늘렸을 때 이 에러가 산발적으로 떴습니다.

해법은 **Sticky Session**. *"한 클라이언트는 항상 같은 서버로 보내라"* 라고 nginx한테 알려줍니다.

```nginx
upstream notify_backend {
  ip_hash;                                    # 클라이언트 IP 기반 sticky
  server backend-a:8080;
  server backend-b:8080;
}

server {
  listen 443 ssl http2;
  server_name notify.example.com;

  location / {
    proxy_pass http://notify_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;   # WebSocket 업그레이드
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;                 # 1시간 동안 연결 유지
  }
}
```

`ip_hash`는 가장 단순한 sticky 방식이에요. 더 정확하게는 쿠키 기반 sticky(`sticky cookie`)나 [HAProxy의 stick-table](https://www.haproxy.com/blog/load-balancing-affinity-persistence-sticky-sessions-what-you-need-to-know) 같은 것도 있는데, 단순 트래픽 분산이라면 `ip_hash`로 충분합니다.

&nbsp;

## 🧪 실제 측정 — 회사 프로젝트 적용 결과

전과 후의 차이가 정말 극적이었어요!

| 분류 | 단일 서버 | 다중 서버 + Pub/Sub |
|------|----------|-------------------|
| 동시 연결 1500 시 CPU | **88%** 🔥 | 각 40% (분산됨) |
| 알림 반영 지연 | 150~300ms | **30~60ms** ⚡ |
| 다른 서버 사용자 알림 | ❌ 누락 (버그) | ✅ 정상 |
| 새 접속자 초기 데이터 | 즉시 (메모리) | 즉시 (Redis 캐시) |
| 서버 한 대 죽었을 때 | 전체 다운 | 다른 서버로 전환 가능 |

CPU 사용률이 절반으로 떨어지면서 응답성이 **5배 가까이 빨라졌어요**. 같은 인프라에 컨테이너 한 대만 더 띄웠을 뿐인데! 그리고 무엇보다, **버그 리포트가 멈췄습니다!** 😎

&nbsp;

## 🤔 진짜 프로덕션은 어떻게 다른가?

당연하지만 우리가 만든 건 **중간 규모의 솔루션**이에요. 진짜 큰 서비스는 다릅니다.

- 🏗️ **Kafka / RabbitMQ** — Redis Streams보다 훨씬 강력한 메시지 브로커. 파티셔닝, 영속화, 복제, 트랜잭션. 슬랙·우버 같은 대규모 서비스의 표준.
- 🌐 **Pub/Sub 매니지드 서비스** — AWS SNS+SQS, GCP Pub/Sub, Azure Service Bus. 직접 운영 안 해도 되는 게 큰 장점.
- 🗺️ **Service Mesh + gRPC streaming** — 서비스끼리는 Pub/Sub 대신 mesh 위의 양방향 stream.
- 📡 **Edge / CDN 활용** — Cloudflare Durable Objects, Fly.io Replay 같은 *"엣지에서 바로 WebSocket 처리"* 패턴.
- 🛡️ **Backpressure / Rate limiting** — 컨슈머가 못 따라갈 때 어떻게 throttle 할지. 우리 구현은 무한히 받아.

근데 이번에도 신기한 건, 디테일을 다 빼고 보면 핵심은 **"서버끼리 메시지 브로커로 통신 + sticky session으로 핸드셰이크 보장"** 한 줄이에요. 🎯

~~참고로 *"WebSocket을 수평 확장하는 게 어렵다"* 는 인식이 있는데, 사실 어려운 게 아니라 **"상태가 메모리에 있다는 사실"** 이 다양한 곳에서 새는 거예요. 채팅 히스토리, 세션 정보, 입력 중 표시... 이런 걸 다 *"메모리 → 공유 저장소"* 로 옮기는 게 진짜 작업이지, Pub/Sub 자체는 어렵지 않습니다.~~

&nbsp;

## 🎬 마무리

만들고 나서 두 가지가 진하게 남았어요!

✅ **"메모리에 박힌 상태는 수평 확장의 적이다."**  
WebSocket 연결, 진행 중인 세션, 캐시... 메모리에 있는 건 다 *"이 서버에서만 유효한 정보"* 예요. 서버를 늘리는 순간 **상태 동기화**라는 새로운 문제가 시작됩니다. 그래서 처음부터 *"이 데이터, 다른 서버도 알아야 하나?"* 를 물으면서 설계하는 게 진짜 시니어의 습관이에요. 💪

✅ **"Redis는 캐시만이 아니다."**  
이미 캐시용으로 깔려있던 Redis가 메시지 브로커, 세션 저장소, 분산 락까지 다 해주는 도구가 됐어요. 한 인프라가 여러 역할을 해주는 게 가성비 좋은 시스템 설계예요. 다음에 *"Redis 깔까 말까"* 고민될 때, **"미래에 메시징도 Redis로 갈 수 있다"** 는 카드를 같이 떠올려보세요. 🎯

&nbsp;

QA 채널의 *"한 서버에 붙은 사람만 알림이 안 와요"* 한 줄에서 시작해, **메시지 브로커 + sticky session**이라는 구조까지 풀어보고 나니, 그동안 막연하게 들리던 *"WebSocket 수평 확장이 어렵다"* 는 인식이 한층 또렷해졌어요. 다음에 트래픽이 늘어 컨테이너를 늘릴 때, 이 글이 든든한 체크리스트가 되어줄 것 같습니다! 🚀✨

```toc
```
