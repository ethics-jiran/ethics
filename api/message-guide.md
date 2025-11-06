# 메신저 메시지 전송 가이드

### 기본 정보

{% hint style="info" %}

- Method: POST
- Content-Type: application/json
  {% endhint %}

### 시작하기

이 문서는 **오피스넥스트 메신저 메시지 전송 API**를 이해하고 설정하는데 도움을 드리기 위한 가이드입니다.

#### **규칙**

- API 설정은 메신저 관리자 페이지([바로가기](https://admin.officewave.co.kr/managements/environment/webhook/))에서 제공됩니다.
  - 경로: 메신저 관리자 페이지 > 관리 메뉴 > Webhook
- 메시지 전송 API 요청 URL은 [`https://jiran-api.officewave.co.kr/api/v1/hooks/{token}/messages`](https://jiran-api.officewave.co.kr/api/v1/hooks/%7Btoken%7D/messages)입니다.

{% hint style="warning" %}
&#x20;메시지 전송 API를 사용하려면 토큰이 필요합니다. 토큰은 오피스넥스트 메신저 관리자 페이지에서 발급 가능합니다.
{% endhint %}

### 요청 헤더

| 헤더명 | 설명 | 필수여부 |
| ------ | ---- | -------- |

### 요청본문

```javascript
{
    "to": ["account@email.com", "account1@email.com", "account2@email.com"],
    "important": true,
    "content":"안녕하세요.메시지 보내드립니다."
}
```

### 요청 파라미터 설명

<table><thead><tr><th>파라미터</th><th>타입</th><th width="336.18359375">설명</th><th>필수여부</th></tr></thead><tbody><tr><td>to</td><td>array</td><td>받는사람(이메일 또는 로그인 계정)</td><td>필수</td></tr><tr><td>important</td><td>boolean</td><td>중요도 표</td><td>옵션</td></tr><tr><td>content</td><td>string</td><td>메시지 내용</td><td>필수</td></tr></tbody></table>

### 응답

```json
{
    "id": "61f2a3eeb6b55776d1070a8e",
    "type": "message",
    "user_id": 1,
    "contents": "eJx7O6vnTfeCN3Nb3k6d8XrlFoU3cye+7t76dmrL68lzXm1oUC,
    "strip_contents": "안녕하세요. 메시지 보내드립니다.",
    "attached_file": false,
    "important": true,
    "sent_at": "2025-01-27 22:53:50+0900",
    "reserved_at": null,
    "compressed": true,
    "deleted_at": null,
    "created_at": "2025-01-27 22:53:50+0900",
    "files": [],
    "recipients":
    [
        {
            "user_id": 2,
            "read_at": null
        },
        {
            "user_id": 1,
            "read_at": null
        }
    ],
    "cc_users": [],
    "hidden_cc_users": []
}
```

### 응답 필드 설명

| 필드            | 타입    | 설명                    |
| --------------- | ------- | ----------------------- |
| id              | string  | 메시지ID                |
| type            | string  | 메시지유형              |
| user_id         | integer | 보낸사람ID(봇)          |
| contents        | string  | 메시지 내용 압축 데이터 |
| strip_contents  | string  | 메시지 내용 태그 제거   |
| attached_file   | boolean | 첨부파일포함 여부       |
| important       | boolean | 중요도 표시             |
| sent_at         | string  | 메시지전송시간          |
| reserved_at     | string  | 메시지예약시간          |
| compressed      | boolean | 메시지내용압축 여부     |
| deleted_at      | string  | 메시지삭제시간          |
| created_at      | string  | 메시지생성시간          |
| files           | array   | 메시지첨부파일 정보     |
| recipients      | array   | 메시지수신자들          |
| cc_users        | array   | 메시지참조자들          |
| hidden_cc_users | array   | 메시지숨은참조자들      |

### 에러코드

<table><thead><tr><th width="133">상태 코드</th><th width="294">설명</th></tr></thead><tbody><tr><td>403</td><td>잘못된 요청</td></tr><tr><td>410</td><td>유효하지 않은 계약상태</td></tr><tr><td>422</td><td>요청 파라미터 유효성 실패</td></tr></tbody></table>
