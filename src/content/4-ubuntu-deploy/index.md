---
emoji: 🌐
title: 'Ubuntu 서버 외부 공개하기'
date: '2025-04-07'
categories: featured-Make Dev Server
---

[Ubuntu 설치와 SSH 원격 접속](/3-ubuntu-setup)까지 마치고 나니, 이제 진짜 서비스가 굴러가는 서버로 만들어볼 차례예요! 🚀

> "이제 뭐만 더 하면 되지?"

라고 생각했는데, 막상 시작해보니 할 게 산더미였습니다. 🤯

이번 글에서 다룰 일들이에요!

- 🗄️ MySQL & Redis 설치와 외부 접속
- 😱 (실화) 회사에서 겪은 **랜섬웨어 해킹 경험담**
- 🔒 SSL 키 기반 DB 접속
- 🌍 도메인 구매와 nginx 설정
- 🛡️ Let's Encrypt 무료 SSL
- 🐳 docker compose로 깔끔하게 정리하기
- 🚨 fail2ban / UFW 추가 보안

길지만 한번에 끝낼게요! 💪

&nbsp;

## 🗄️ MySQL & Redis 설치

서버에 MySQL과 Redis를 설치했습니다. **MySQL은 메인 데이터베이스로, Redis는 캐싱과 세션 관리용**으로 쓸 예정이에요!

```bash
# MySQL 설치
sudo apt update
sudo apt install mysql-server -y

# Redis 설치
sudo apt install redis-server -y

# 둘 다 자동 시작 등록
sudo systemctl enable mysql redis-server
```

설치는 정말 쉬웠어요. 명령어 몇 줄이면 끝!

근데 진짜 어려운 건 **외부 접속 설정**이었습니다. 기본적으로 두 DB는 localhost에서만 접속 가능하거든요. 🤔

```bash
# MySQL 외부 접속 설정
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# bind-address를 0.0.0.0으로 변경

# Redis 외부 접속 설정
sudo nano /etc/redis/redis.conf
# bind 0.0.0.0
# requirepass <strong-password>

# 사용자 권한 설정 (MySQL)
mysql -u root -p
> CREATE USER 'username'@'%' IDENTIFIED BY 'password';
> GRANT ALL PRIVILEGES ON *.* TO 'username'@'%';
> FLUSH PRIVILEGES;
```

공유기에서 **3306번(MySQL)**, **6379번(Redis)** 포트를 미니 PC로 포트포워딩 설정해줬어요.

이제 외부에서도 DB 클라이언트로 접속이 잘 됩니다! 🎉

근데 여기서 끝이라고 생각하면... **큰일 납니다.** 😱

&nbsp;

## 😱 실제 해킹 경험담 — 잊을 수 없는 그 아침

실제로 회사에서 프로젝트를 진행하던 중 해킹을 당하게 되었습니다.

어느 날 아침, 평소처럼 출근해서 데이터베이스에 접속했는데 **모든 테이블이 사라져 있었어요!** 😨
대신 **`give_me_the_money`** 라는 이상한 테이블 하나만 덩그러니 있더라고요.

호기심을 참지 못하고 그 테이블을 열어보니 다음과 같은 내용이 적혀있었습니다.

> "Your database has been backed up to our servers. To restore your data, please contact us and pay the ransom. Bitcoin payment only."

**랜섬웨어 공격**을 당한 거였어요! 🚨

복잡한 패스워드 조합으로 설정해뒀으니 *"해킹은 남의 얘기"* 라고 생각했는데... 세상은 생각보다 차가웠어요. 🥶

다행히 **백업 데이터**가 있어서 나쁜 해커들의 뜻대로 되지 않고 큰 문제없이 복구할 수 있었습니다!
그리고 **백업의 소중함**을 다시 한번 뼈저리게 느꼈어요. 💾

하지만 이 사건 이후로는 **보안에 대한 경각심**이 180도 바뀌었습니다.
*"내 미니 PC에 똑같은 일이 벌어지면 어쩌지?"* 라는 생각이 들었거든요. 🥶

&nbsp;

## 🔒 해법 1 — SSL 키 기반 접속

패스워드만으로는 부족하다는 걸 깨달았으니, **SSL 키로만 접속**하도록 바꿨어요. 키가 없으면 아예 핸드셰이크가 안 됩니다! 🛡️

```bash
# MySQL SSL 인증서 자동 생성
sudo mysql_ssl_rsa_setup

# SSL 강제 사용자 생성
mysql -u root -p
> CREATE USER 'ssl_user'@'%' IDENTIFIED BY 'password' REQUIRE SSL;
> GRANT ALL PRIVILEGES ON db_name.* TO 'ssl_user'@'%';
```

클라이언트에서 접속할 때도 SSL 옵션을 줘야 해요!

```bash
mysql --ssl-ca=ca.pem \
      --ssl-cert=client-cert.pem \
      --ssl-key=client-key.pem \
      -u ssl_user -p -h 서버IP
```

이제 누가 IP를 알아내도, 키가 없으면 절대 못 들어옵니다. 🔒

&nbsp;

## 🛡️ 해법 2 — fail2ban과 UFW로 무차별 대입 차단

해킹 공격의 90%는 **무차별 대입(brute force)** 이에요. 정해진 시간 안에 너무 많이 실패한 IP를 차단해버리면 대부분의 공격이 막힙니다!

### UFW 방화벽 설정

```bash
# 기본 정책: 들어오는 건 거부, 나가는 건 허용
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 필요한 포트만 명시적으로 열기
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS

# DB 포트는 특정 IP만 허용하는 게 더 안전!
sudo ufw allow from <내IP> to any port 3306
sudo ufw allow from <내IP> to any port 6379

# 활성화
sudo ufw enable
sudo ufw status verbose
```

### fail2ban으로 IP 자동 차단

```bash
sudo apt install fail2ban -y

# 설정 파일 작성
sudo nano /etc/fail2ban/jail.local
```

```ini
[sshd]
enabled = true
maxretry = 5         # 5번 실패하면
bantime = 3600       # 1시간 동안 차단
findtime = 600       # 10분 안에 5번이면

[mysqld-auth]
enabled = true
maxretry = 3
bantime = 86400      # MySQL은 더 빡세게! 24시간 차단
```

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd
```

이걸 적용하고 나서 며칠 뒤에 로그를 봤는데, **이미 수백 개의 IP가 차단**돼 있더라고요. 😱
보안 안 했으면 진짜 큰일 날 뻔했어요. 💦

&nbsp;

## 🌍 도메인 구매와 nginx 웹 서버 설정

웹 페이지에서 IP 주소로 접속하는 건 멋없잖아요? 그래서 도메인을 구매했습니다!

효자답게 어머니가 불러주시는 애칭인 **허니**를 딴 `honey.com`로 하고 싶었지만 역시나... 이미 존재하는 도메인이라
아쉽지만 `seunghoney.com` 도메인으로 멋진 이름을 하나 골랐어요. 😎

도메인을 구매한 다음엔 **nginx 설치**와 **DNS 설정**이 필요했습니다.

```bash
# nginx 설치
sudo apt install nginx -y

# 설정 파일 작성
sudo nano /etc/nginx/sites-available/seunghoney.com
```

nginx 설정에서는 **HTTP → HTTPS 리다이렉트**를 적용했어요. 요즘 시대에 HTTP로 접속하는 건 너무 위험하니까요! 🚫

```nginx
# /etc/nginx/sites-available/seunghoney.com
server {
    listen 80;
    server_name seunghoney.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seunghoney.com;

    ssl_certificate     /etc/letsencrypt/live/seunghoney.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seunghoney.com/privkey.pem;

    location / {
        # 애플리케이션 서버로 프록시
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

`proxy_pass`로 nginx가 **리버스 프록시 역할**을 해줘요. 클라이언트는 nginx에만 접속하고, nginx가 뒤에 있는 앱 서버에 요청을 넘겨주는 구조예요. 🎯

&nbsp;

## 🛡️ Let's Encrypt 무료 SSL 인증서

HTTPS를 쓰려면 SSL 인증서가 필요한데, 보통은 비싸요. 하지만 **Let's Encrypt** 는 무료입니다! 🎉

```bash
# certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# nginx 자동 설정으로 인증서 발급
sudo certbot --nginx -d seunghoney.com -d www.seunghoney.com
```

그리고 인증서는 90일마다 갱신해줘야 하는데, 이것도 자동화 가능해요!

```bash
# 자동 갱신 테스트
sudo certbot renew --dry-run

# cron에 자동 갱신 등록 (이미 systemd timer로 등록되어 있을 수 있음)
sudo systemctl status certbot.timer
```

이제 [https://blog.seunghoney.com](https://blog.seunghoney.com)으로 안전하게 접속할 수 있습니다! 🔒

당연히 **80번(HTTP)**, **443번(HTTPS)** 포트도 방화벽과 포트포워딩 설정을 해줬어요.

&nbsp;

## 🐳 docker compose로 깔끔하게 정리하기

여기까지 오면서 서버에 직접 설치한 게 너무 많아져서, **docker compose**로 정리했어요. 컨테이너로 돌리면 관리도 쉽고, 다른 서버로 이전하기도 편하거든요! 🐳

```yaml
# docker-compose.yml
services:
  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - '127.0.0.1:3306:3306' # 호스트의 localhost로만 노출 (외부는 SSH 터널로)

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - '127.0.0.1:6379:6379'

  app:
    build: ./app
    restart: unless-stopped
    depends_on:
      - mysql
      - redis
    environment:
      DATABASE_URL: mysql://app:${MYSQL_APP_PASSWORD}@mysql:3306/myapp
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    ports:
      - '127.0.0.1:3000:3000'

volumes:
  mysql_data:
  redis_data:
```

**핵심 포인트**!

- 🔒 **포트를 `127.0.0.1`에 바인딩** — 외부에 직접 노출하지 않고, nginx 리버스 프록시를 통해서만 접근하게 해요.
- 🔄 **`restart: unless-stopped`** — 컨테이너가 죽으면 자동으로 재시작됩니다. 사용자가 명시적으로 stop했을 때는 재시작하지 않아요.
- 💾 **named volume** — 컨테이너가 사라져도 데이터는 보존됩니다.

이렇게 정의해두면 명령어 한두 줄로 전체 스택을 다룰 수 있어요!

```bash
# 한 번에 띄우기
docker compose up -d

# 로그 보기
docker compose logs -f app
```

이렇게 정리해두니까 **서버 관리가 진짜 편해졌어요**. 새 서버로 옮길 때도 yml 파일이랑 .env만 가져가면 끝이거든요. ✨

&nbsp;

## 🎬 마무리

여기까지 정리하면!

✅ **MySQL & Redis 외부 접속** 가능  
✅ **SSL 키 기반 DB 접속**으로 보안 강화  
✅ **fail2ban / UFW**로 무차별 대입 차단  
✅ **도메인 + nginx + Let's Encrypt**로 HTTPS 적용  
✅ **docker compose**로 깔끔하게 정리  

설정 과정에서 정말 많은 걸 배웠어요. 특히 **보안의 중요성**을 크게 느꼈습니다.
단순히 포트만 열어두면 안 되고, 각각의 서비스마다 적절한 보안 설정이 필요하다는 걸 깨달았어요. 🛡️

처음엔 *"Ubuntu만 설치하면 끝 아닌가?"* 했는데... 글이 이만큼 길어진 걸 보면 답이 나오죠. 😅

이 모든 과정을 통해 **서버 관리 능력**이 많이 늘었고, 무엇보다 **내가 직접 구축한 서버**라는 자부심이 생겼습니다. 💪

```toc
```
