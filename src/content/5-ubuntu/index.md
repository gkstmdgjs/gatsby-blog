---
emoji: 🖥️
title: '개발자의 낭만, 나만의 서버 만들기'
date: '2025-03-28'
categories: featured-Make Dev
---

지난 글에서 미니 PC 조립을 성공적으로 마쳤다면, 이제 진짜 서버의 모습을 갖춰야 할 차례입니다.

조립만 끝난 미니 PC는 그냥 **작은 고철 덩어리**일 뿐이에요. 여기에 Ubuntu 서버를 설치하고 각종 설정을 마쳐야 비로소 **나만의 개발 서버**가 되는 거죠! 💪

처음엔 단순히 Ubuntu만 설치하면 끝인 줄 알았는데... 생각보다 할 일이 정말 많더라고요. 🤯

&nbsp;

## 🐧 Ubuntu 서버 설치와 첫 만남

Ubuntu Server 22.04 LTS 버전을 선택했습니다. **LTS(Long Term Support)**라는 이름답게 5년간 지원받을 수 있어서 안정성 면에서 최고죠!

설치 과정은 생각보다 순조로웠습니다. USB 부팅 디스크를 만들고, 미니 PC에 꽂고, 설치 마법사를 따라가며 본인에게 알맞은 설정을 해주면 쉽게 설치가 됩니다.

**하지만!!** 설치가 끝나고 나서가 진짜 시작이었어요. 😅

가장 먼저 한 일은 **root 계정 활성화**였습니다. Ubuntu는 기본적으로 root 계정이 비활성화되어 있거든요. 
하지만 서버 관리를 위해서는 root 권한이 필요한 경우가 많아서 활성화해줬습니다.

```bash
# root 계정 패스워드 설정
sudo passwd root

# root 계정으로 전환
su -
```

&nbsp;

## 🔐 보안 첫 번째 관문: SSH 키 인증

외부에서 서버에 접속하려면 SSH가 필요한데, 기본 패스워드 방식은 보안상 너무 위험해요. 패스워드를 무차별 대입으로 뚫으려는 공격이 정말 많거든요! 😱

그래서 **SSH 키 인증 방식**으로 바꿔줬습니다. 이렇게 하면 키가 없으면 아예 접속이 불가능해져요.

```bash
# SSH 키 생성 (클라이언트에서)
ssh-keygen -t rsa -b 4096

# 서버에 공개 키 복사
ssh-copy-id username@server-ip

# SSH 설정 수정 (패스워드 로그인 비활성화)
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
# PubkeyAuthentication yes
```

이제 패스워드 없이도 안전하게 서버에 접속할 수 있어요! 🔒

## 🌐 VSCode로 원격 개발 환경 구축

개발할 때 터미널만 쓰기엔 너무 불편하잖아요? VSCode의 **Remote SSH** 확장을 사용하면 마치 로컬에서 작업하는 것처럼 원격 서버에서 개발할 수 있어요!

하지만 여기서 중요한 건 **방화벽 설정**과 **포트포워딩**이에요. 

```bash
# 방화벽에서 SSH 포트 허용
sudo ufw allow 22

# 공유기에서 22번 포트를 미니 PC로 포트포워딩 설정
# 192.168.x.x:22 → 외부IP:22
```

이젠 집이 아닌 외부에서도 VSCode로 원격 접속하여 코딩할 수 있어요! ✨

&nbsp;

## 🗄️ MySQL & Redis

서버에 MySQL과 Redis를 설치했습니다. MySQL은 메인 데이터베이스로, Redis는 캐싱과 세션 관리용으로 사용할 예정이에요!

MySQL 설치는 간단했지만, **외부 접속 설정**은 조금 까다로웠어요. 기본적으로 MySQL은 localhost에서만 접속 가능하거든요.

```bash
# MySQL 설치
sudo apt install mysql-server

# 외부 접속을 위한 설정 변경
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# bind-address를 0.0.0.0으로 변경

# 사용자 권한 설정
CREATE USER 'username'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'username'@'%';
```

**하지만 여기서 끝이 아니에요!** MySQL을 외부에 열어두면 보안상 매우 위험합니다.
갑자기 해킹을 당해서 데이터가 없어지는 경우가 있을 수 있어요.

### 😱 실제 해킹 경험담

실제로 회사에서 프로젝트를 진행하던 중 해킹을 당하게 되었습니다.

어느 날 아침, 평소처럼 출근해서 데이터베이스에 접속했는데 **모든 테이블이 사라져 있었어요!** 😨
대신 **`give_me_the_money`** 라는 이상한 테이블 하나만 덩그러니 있더라고요.

호기심을 참지 못하고 그 테이블을 열어보니 다음과 같은 내용이 적혀있었습니다:

> "Your database has been backed up to our servers. To restore your data, please contact us and pay the ransom. Bitcoin payment only."

**랜섬웨어 공격**을 당한 거였어요! 🚨

복잡한 패스워드 조합으로 설정해뒀으니 "해킹은 남의 얘기"라고 생각했는데... 세상은 생각보다 차가웠어요. 🥶
다행히 **백업 데이터**가 있어서 나쁜 해커들의 뜻대로 되지 않고 큰 문제없이 복구할 수 있었습니다! 
그리고 백업의 소중함을 다시 한번 뼈저리게 느꼈어요. 💾

하지만 이 사건 이후로는 **보안에 대한 경각심**이 180도 바뀌었습니다. 
그래서 **SSL 인증**을 설정해줬어요. 패스워드 대신 SSL 키로만 접속할 수 있게 만든 거죠! 🛡️

```bash
# MySQL SSL 설정
sudo mysql_ssl_rsa_setup

# SSL 키 기반 사용자 생성
CREATE USER 'ssl_user'@'%' IDENTIFIED BY 'password' REQUIRE SSL;
```

Redis도 마찬가지로 설치하고 외부 접속 설정을 해줬습니다. Redis는 3306번(MySQL), 6379번(Redis) 각각 기본 포트를 공유기에서 포트포워딩 설정해줬어요.

&nbsp;

## 🌍 도메인과 nginx로 웹 서버 완성

웹 페이지에서 IP 주소로 접속하는 건 멋없기에 도메인을 구매했습니다!

효자답게 어머니가 불러주시는 애칭인 **허니**를 딴 `honey.com`로 하고 싶었지만 역시나... 이미 존재하는 도메인이라 
아쉽지만 `seunghoney.com` 도메인으로 멋진 이름을 하나 골랐어요. 😎

도메인을 구매한 다음엔 **nginx 설치**와 **DNS 설정**이 필요했습니다.

```bash
# nginx 설치
sudo apt install nginx

# nginx 설정 파일 작성
sudo nano /etc/nginx/sites-available/mydomain.com
```

nginx 설정에서는 **HTTP to HTTPS 리다이렉트**를 설정해줬어요. 요즘 시대에 HTTP로 접속하는 건 너무 위험하니까요!

```nginx
server {
    listen 80;
    server_name mydomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name mydomain.com;
    
    ssl_certificate /path/to/certificate;
    ssl_certificate_key /path/to/private_key;
    
    location / {
        # 애플리케이션 서버로 프록시
        proxy_pass http://localhost:3000;
    }
}
```

**Let's Encrypt**를 사용해서 무료 SSL 인증서도 발급받고 자동 갱신도 설정해줬어요. 
이제 [`https://blog.seunghoney.com`](https://blog.seunghoney.com)으로 안전하게 접속할 수 있습니다! 🔒

당연히 80번(HTTP), 443번(HTTPS) 포트도 방화벽과 포트포워딩 설정을 해줬어요.

&nbsp;

## 🎬 마무리

모든 설정을 마치고 나니 정말 뿌듯했어요! 손바닥보다 작은 미니 PC가 사랑스러워 보이기까지 했습니다.

✅ **외부에서 VSCode로 원격 개발 및 배포** 가능  
✅ **도메인으로 웹 서비스** 접속 가능  
✅ **MySQL, Redis 외부 접속** 가능  
✅ **SSL/TLS로 보안** 강화  
✅ **SSH 키 인증으로 서버 접속** 보안 강화  

설정 과정에서 정말 많은 걸 배웠어요. 특히 **보안의 중요성**을 크게 느꼈습니다. 
단순히 포트만 열어두면 안 되고, 각각의 서비스마다 적절한 보안 설정이 필요하다는 걸 깨달았어요.

처음엔 "Ubuntu만 설치하면 끝 아닌가?" 했는데... 생각보다 할 일이 산더미였네요! 😅

하지만 이 모든 과정을 통해 **서버 관리 능력**이 많이 늘었고, 무엇보다 **내가 직접 구축한 서버**라는 자부심이 생겼습니다.

미니 PC 조립부터 Ubuntu 서버 구축까지... 정말 긴 여정이었네요! 🚀

이제 진짜로 나만의 개발 환경이 완성되었습니다. 집에서든, 카페에서든, 회사에서든 언제 어디서나 내 서버에 접속해서 개발할 수 있어요.

**개발자라면 본인 서버 하나쯤은 있어야지~** 라는 낭만을 실현했지만, 이제 그 서버를 **제대로 활용**하는 것이 진짜 시작인 것 같아요! 💪
```toc
``` 