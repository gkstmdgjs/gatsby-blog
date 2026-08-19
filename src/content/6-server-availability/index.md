---
emoji: 🛡️
title: '서버 가용성 높이기'
date: '2025-06-22'
categories: featured-Make Dev Server
---

[서버 외부 공개](/4-ubuntu-deploy)까지 마치고 이제 다 끝났다고 생각했어요. 근데 어느 새벽 한 통의 알림이 오더니 진짜 큰 깨달음이 왔습니다. 🥶

> "[헬스체크] blog.seunghoney.com — 응답 없음"

새벽 3시였어요. 비몽사몽 휴대폰을 보면서 *"뭐지? 서버가 왜 죽었지?"* 라는 생각이 들었죠.

침대에서 일어나서 노트북을 켜고 SSH로 접속해보니... **접속조차 안 되는 거예요.** 😱

다음 날 아침에야 알게 됐는데, **새벽에 잠깐 정전이 났던 것**이었어요. 전기가 다시 들어왔는데 미니 PC가 자동으로 켜지지 않았고, 결국 **반나절 동안 블로그가 다운**돼 있었습니다. 🥶

> "어... 새벽에 정전이 나면 서버는 누가 다시 켜?"  
> "출장 중에 공유기 IP가 바뀌면 어떡해?"  
> "회사에서 접속 안 되는 걸 발견하면 너무 늦은 거잖아!"

이 사건 이후로 깨달았어요. **서버는 켜두는 게 끝이 아니라 24시간 살아있게 만드는 게 진짜 시작**이라는 사실을요. 💡

이 글은 그 깨달음 이후로 미니 PC를 **장애에 강한 서버**로 진화시킨 과정을 정리한 후기예요!

&nbsp;

## 📌 일단 가용성이라는 단어부터

엔터프라이즈 세계에서 가용성을 얘기할 때 흔히 쓰는 표현이 있어요.

| 가용성 | 연간 다운타임 | 별명 |
|--------|--------------|------|
| 99% | 약 3.6일 | "two nines" |
| 99.9% | 약 8.7시간 | "three nines" 🥉 |
| 99.99% | 약 52분 | "four nines" 🥈 |
| 99.999% | 약 5분 | "five nines" 🥇 |

근데 솔직히 말씀드리면, 가정용 홈서버에서 **99.99%는 사실상 불가능**해요. 😅 통신사 회선이 끊기는 순간 끝이거든요.

그래서 이 글의 목표는 **"99% (연간 3.6일 다운타임 이내)"** 입니다. 욕심부리지 말고, 흔한 사고에 대비해서 **자동으로 살아나는 서버**를 만드는 게 목표예요! 🎯

대비할 사고는 크게 네 가지로 분류했어요.

- ⚡ **전원 사고** — 정전, 순간 정전, 전원 어댑터 문제
- 🌐 **네트워크 사고** — IP 변경, 공유기 재부팅, 통신사 장애
- 🐛 **소프트웨어 사고** — 메모리 누수, 무한 루프, OOM
- 🚨 **모니터링 사각지대** — 죽었는데 내가 모르는 상태

하나씩 차근차근 막아볼게요. 💪

&nbsp;

## ⚡ 전원 대응 — 정전이 나도 자동으로 켜지게

새벽 정전 사건이 가르쳐준 두 가지 중요한 사실이 있었어요.

1. **미니 PC는 정전 후 자동으로 켜지지 않는다.**
2. **순간 정전(1초)도 컴퓨터에는 강제 종료다.**

이 두 가지를 막아야 합니다. 🎯

### 1) 🔋 UPS — 무정전 전원 공급장치

UPS는 쉽게 말해 **콘센트와 미니 PC 사이에 끼워넣는 비상 배터리**예요. 정전이 나면 배터리로 잠깐 동안 버텨줍니다.

저는 약 7~8만 원짜리 가정용 UPS를 들였는데, 가성비가 정말 좋았어요!

- 🔋 **순간 정전 (~1초)** → UPS가 그대로 막아줌. 미니 PC는 정전인 줄도 모름.
- ⏱️ **5분 이내 정전** → UPS 배터리로 버티다가 전원 복구되면 정상 동작.
- 💀 **5분 이상 장기 정전** → 안전하게 셧다운 (다음 단계에서 처리)

UPS만 달았는데도 *"어, 정전이 안 났네?"* 싶을 만큼 안정성이 확 올라갔어요. ✨

### 2) 🛌 BIOS의 "Restore on AC Power Loss" 옵션

장기 정전이 발생해서 미니 PC가 결국 꺼지더라도, **전원이 복구되면 자동으로 켜지게** 만들 수 있어요!

대부분의 메인보드 BIOS에 이 옵션이 숨어있습니다.

```text
BIOS 설정 → Power Management → Restore on AC Power Loss
  ❌ Power Off (기본값) → 정전 후 직접 전원 버튼 눌러야 함
  ✅ Power On         → 전원 복구되면 자동으로 켜짐!
  ⚠️ Last State       → 꺼져있던 상태를 기억해서 그대로 유지
```

이 옵션을 **Power On**으로 바꿔두는 것만으로 새벽 정전 사건 같은 일은 다시 안 일어납니다! 🎉

이걸 진작 알았으면 새벽에 잠 깰 일이 없었을 텐데... 😅

&nbsp;

## 🌐 네트워크 대응 — IP가 바뀌어도 도메인은 살아있게

가정용 인터넷의 가장 큰 함정은 **IP가 동적으로 바뀐다는 것**이에요. 통신사가 가끔 IP를 바꿔주는데, 그러면 도메인이 옛 IP를 가리키니까 접속이 안 됩니다. 😱

해결책은 두 가지예요!

### 1) 🔄 DDNS — IP가 바뀌면 자동으로 알리기

**DDNS(Dynamic DNS)** 는 IP가 바뀔 때마다 도메인 레코드를 자동으로 갱신해주는 서비스예요.

저는 [Cloudflare API](https://api.cloudflare.com/) 를 써서 직접 만들었어요!

```bash
#!/bin/bash
# /usr/local/bin/cf-ddns.sh
ZONE_ID="your_zone_id"
RECORD_ID="your_record_id"
DOMAIN="seunghoney.com"
TOKEN="your_api_token"

CURRENT_IP=$(curl -s https://ipv4.icanhazip.com)
DNS_IP=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.result.content')

if [ "$CURRENT_IP" != "$DNS_IP" ]; then
  curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$RECORD_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"A\",\"name\":\"$DOMAIN\",\"content\":\"$CURRENT_IP\",\"ttl\":120}"

  echo "IP 변경 감지: $DNS_IP → $CURRENT_IP"
fi
```

5분마다 cron으로 돌리면 끝!

```bash
# crontab -e
*/5 * * * * /usr/local/bin/cf-ddns.sh >> /var/log/cf-ddns.log 2>&1
```

### 2) 🚇 Cloudflare Tunnel — 아예 IP 노출을 안 한다

더 깔끔한 방법은 **Cloudflare Tunnel**이에요. 공유기 포트포워딩을 안 해도 되고, 내 IP가 외부에 노출되지도 않아요!

```bash
# cloudflared 설치
sudo apt install cloudflared -y

# 터널 만들고 도메인 연결
cloudflared tunnel login
cloudflared tunnel create my-tunnel
cloudflared tunnel route dns my-tunnel blog.seunghoney.com

# 시스템 서비스로 등록
sudo cloudflared service install
```

서버가 Cloudflare로 **나가는 연결**을 만들어두면, 외부 트래픽이 그 터널을 통해 들어옵니다. 들어오는 포트를 안 열어도 되니까 보안적으로도 훨씬 안전해요! 🛡️

&nbsp;

## 🐛 자가 회복 — 죽으면 자동으로 살아나게

아무리 잘 짠 코드도 가끔 죽어요. 메모리 누수, 데드락, OOM... 이유는 다양하죠. 중요한 건 **죽었을 때 자동으로 다시 일어나게** 만드는 거예요!

### 1) 🐳 docker — `restart: unless-stopped`

[docker compose로 정리해둔 구성](/4-ubuntu-deploy)이 여기서 빛을 발합니다!

```yaml
services:
  app:
    image: my-app
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

- 🔄 **`restart: unless-stopped`** — 컨테이너가 죽으면 자동 재시작. 단, 사용자가 명시적으로 stop했을 때는 안 함.
- 💚 **`healthcheck`** — 30초마다 헬스체크. 3번 연속 실패하면 unhealthy로 표시.

### 2) 🏗️ systemd — Docker 외 서비스용

Docker로 안 돌리는 서비스는 systemd unit 파일을 만들어서 자동 재시작 정책을 적용했어요.

```ini
# /etc/systemd/system/my-service.service
[Unit]
Description=My Service
After=network.target

[Service]
ExecStart=/usr/local/bin/my-service
Restart=always
RestartSec=5
StartLimitInterval=60
StartLimitBurst=5

[Install]
WantedBy=multi-user.target
```

- 🔄 **`Restart=always`** — 어떤 이유로 죽든 다시 살림
- ⏱️ **`RestartSec=5`** — 5초 간격으로 재시작
- 🚫 **`StartLimitBurst=5`** — 1분 안에 5번 이상 죽으면 멈춤 (무한 재시작 루프 방지)

마지막 옵션이 정말 중요해요! 안 그러면 *코드가 100% 망가졌는데 1초마다 다시 살리려고 시도하는* 좀비 서버가 됩니다. 🧟

&nbsp;

## 🚨 모니터링 — 죽은 줄도 모르는 게 가장 무서워

가용성 작업 중 가장 중요한 건 사실 **모니터링** 이라고 생각해요. 모르고 넘어가는 사이 사용자는 이미 떠나니까요. 😢

### 1) 🐝 Uptime Kuma — 직접 호스팅하는 모니터링 도구

오픈소스 헬스체크 도구인데, 셀프 호스팅이 가능하고 UI도 정말 예쁘게 잘 되어 있어요!

```yaml
# docker-compose.yml에 추가
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    restart: unless-stopped
    ports:
      - '127.0.0.1:3001:3001'
    volumes:
      - uptime_kuma_data:/app/data

volumes:
  uptime_kuma_data:
```

대시보드에서 **HTTP, TCP, ping, DNS** 등 다양한 방식으로 헬스체크를 설정할 수 있어요. 응답 시간 그래프까지 깔끔하게 보여줍니다! 📊

### 2) 📲 디스코드 webhook — 죽으면 즉시 알림

Uptime Kuma가 죽음을 감지하면 **디스코드 채널로 즉시 알림**이 오도록 설정했어요!

```bash
# 서버가 죽으면 cron으로 직접 보낼 수도 있다
WEBHOOK_URL="https://discord.com/api/webhooks/..."

if ! curl -sf https://blog.seunghoney.com/health > /dev/null; then
  curl -X POST -H "Content-Type: application/json" \
    -d "{\"content\":\"🚨 blog.seunghoney.com 응답 없음!\"}" \
    "$WEBHOOK_URL"
fi
```

이제 새벽에 서버가 죽어도 **휴대폰이 띵 울리니까** 늦어도 다음 날 아침에는 인지할 수 있어요. 🔔

물론 새벽에 자고 있을 땐 어차피 못 보지만, 적어도 *"반나절 동안 블로그가 죽어있는데 모름"* 같은 사태는 막을 수 있죠. 😅

&nbsp;

## 💾 백업 — 마지막 보루

[랜섬웨어 사건](/4-ubuntu-deploy)에서 가장 큰 교훈이 **"백업이 진리다"** 였잖아요? 가용성과는 살짝 다른 주제지만, 이번 글에서 빠뜨릴 수 없어서 정리해봤어요.

### 3-2-1 규칙

오래된 격언인데 지금도 통용돼요!

- 📁 **3개의 사본**을 유지하고
- 💿 **2가지 다른 매체**에 저장하고
- 🌍 **1개는 오프사이트**(외부 위치)에 둔다

저는 이렇게 적용했어요!

```bash
#!/bin/bash
# /usr/local/bin/backup-mysql.sh
DATE=$(date +%Y%m%d)
BACKUP_DIR="/var/backups/mysql"

# 1) 로컬 백업
docker exec mysql mysqldump --all-databases -u root -p$MYSQL_ROOT_PASSWORD \
  | gzip > "$BACKUP_DIR/all-$DATE.sql.gz"

# 2) 외장 SSD에도 복사
rsync -av "$BACKUP_DIR/all-$DATE.sql.gz" /mnt/external-ssd/backups/

# 3) 클라우드(예: rclone으로 R2에 업로드)
rclone copy "$BACKUP_DIR/all-$DATE.sql.gz" cloudflare-r2:my-backups/

# 4) 30일 지난 백업은 정리
find "$BACKUP_DIR" -name "all-*.sql.gz" -mtime +30 -delete
```

매일 새벽 4시에 cron으로 실행되도록 등록해두면 끝!

```bash
# crontab -e
0 4 * * * /usr/local/bin/backup-mysql.sh >> /var/log/backup.log 2>&1
```

해커가 다시 나타나도 이젠 떨릴 일이 없어요. 😎

&nbsp;

## 🎬 마무리

새벽 정전 사건 이후로 미니 PC는 정말 많이 진화했어요!

✅ **UPS + BIOS Power On** — 정전이 나도 자동 복구  
✅ **Cloudflare Tunnel** — IP 바뀌어도 도메인 살아있음  
✅ **docker restart + systemd** — 죽으면 자동 재시작  
✅ **Uptime Kuma + 디스코드** — 죽으면 즉시 알림  
✅ **3-2-1 백업 규칙** — 데이터는 절대 잃지 않게  

가용성 작업을 하면서 진하게 남은 두 가지 깨달음이 있어요!

✅ **"가용성은 비용이다."**  
99%에서 99.9%로 올리는 건 비용이 두 배쯤 들고, 99.9%에서 99.99%로 가려면 또 비용이 두 배 들어요. 가정용 서버에선 **"완벽함"이 아니라 "내가 감당할 수 있는 수준"** 을 정하는 게 더 중요하다는 걸 배웠습니다. 💰

✅ **"모니터링이 진짜다."**  
다른 모든 작업을 다 해도, 죽었을 때 **알 수 있느냐**가 가장 중요해요. 모르고 넘어가는 사이 사용자는 떠나니까요. 알림 한 번이 다른 모든 자동화보다 더 가치 있을 때가 많습니다. 🔔

&nbsp;

어느덧 미니 PC가 단순한 컴퓨터에서 **24시간 365일 안정적으로 돌아가는 진짜 서버**로 성장했어요.
처음에 *"개발자라면 본인 서버 하나쯤은 있어야지~"* 라고 시작했던 낭만이, 지금은 **블로그, 게임 서버([Cat Run](/5-cat-run)도 여기서 굴러가요!), 사이드 프로젝트**까지 책임지는 든든한 친구가 되었습니다! 💪

홈서버는 99.99%까지는 못 가도, **99% 정도는 충분히 만들 수 있어요.** 그리고 그 1%의 다운타임이 발생해도, 어떤 일이 일어났는지 **즉시 알고 빠르게 복구할 수 있는 시스템**이라면 충분합니다! 🎯

이제 진짜로 **"개발자라면 집에 본인 서버 하나쯤은 있어야지~"** 라는 낭만을 자신 있게 이야기할 수 있을 것 같아요. 🚀

```toc
```
