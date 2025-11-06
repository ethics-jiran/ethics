# 메신저 서비스알림 가이드

## 기본 정보

{% hint style="info" %}
**서비스 봇 등록 최대 개수**

- 20개(기본 봇 제외)
- 기본 봇이란? 오피스넥스트에서 제공하는 시스템 봇
  {% endhint %}

### 시작하기

이 문서는 **오피스넥스트 메신저 서비스 알림 전송 API**를 이해하고 설정하는데 도움을 드리기 위한 가이드입니다.

#### **규칙**

- API 설정은 메신저 관리자 페이지([바로가기](https://admin.officewave.co.kr/managements/environment/webhook/))에서 제공됩니다.
  - 경로: 메신저 관리자 페이지 > 관리 메뉴 > Webhook
- 서비스 알림 전송 API 요청 URL은[`https://api.officewave.co.kr/api/v1/hooks/{token}/notifications`](https://api.officewave.co.kr/api/v1/hooks/%7Btoken%7D/notifications) 입니다.

{% hint style="warning" %}
&#x20;서비스 알림 전송 API를 사용하려면 토큰이 필요합니다. 토큰은 오피스넥스트 메신저 관리자 페이지에서 발급 가능합니다.
{% endhint %}

서비스알림 전송 API는 페이지와 데이터베이스 리소스에 대한 `POST` 요청을 통해 작업을 수행하는 RESTful 규칙을 따릅니다. 요청과 응답 본문은 JSON으로 인코딩됩니다.

#### **JSON 규칙**

- JSON 형식에 필요한 데이터는 `whole`, `to`, `type`, `template`, `contents`, `items` 입니다.
- `whole` 데이터는 전체 전송 여부 값이며, boolean 값입니다. true일 경우 전체 전송입니다.
- `to` 데이터는 받는 사람의 오피스웨이브 사용자 ID 또는 email 값을 입력하면 됩니다. 배열형식이며 여러명에게 보낼 수 있습니다. `whole`이 true인 경우 to 값은 빈 배열이어야 합니다.
- `type` 데이터는 서비스알림의 유형입니다. `type` 값은 `default`, `static`, `carousel` 값이 있습니다.

| type     | 설명                                                          |
| -------- | ------------------------------------------------------------- |
| default  | 버튼이나 링크가 연결되지 않고 텍스트형식만 보내는 방식입니다. |
| static   | 버튼이나 링크가 추가된 방식입니다.                            |
| carousel | static 방식의 서비스알림을 한꺼번에 묶어서 보내는 방식입니다. |

- `template` 데이터는 서비스알림의 표현 레이아웃를 의미합니다. `template` 값은 `text`, `card`, `list` 값이 있습니다.
- `template` 데이터는 서비스알림의 표현 레이아웃를 의미합니다. `template` 값은 `text`, `card`, `list` 값이 있습니다.

| template | 설명                                                              |
| -------- | ----------------------------------------------------------------- |
| text     | 텍스트로만 구성되어있는 레이아웃입니다.                           |
| card     | 사진과 텍스트로 구성되어있는 레이아웃입니다.                      |
| list     | 사진과 텍스트로 구성된 아이템들을 여러개 표현하는 레이아웃입니다. |

- `contents` 데이터는 서비스알림에서 `type` 이 `default` 일 때에만 사용하는 값으로써, 순수 텍스트만 보내는 경우에 사용합니다.
- `items` 데이터는 `type`이 `default`를 제외한 `static`, `carousel` 템플릿에서만 사용할 수 있습니다.
- 아래 타입 / 템플릿 예시의 json 값을 body에 담아서 요청하면 예시 사진과 같이 표시되게 됩니다.

## 사용 예시

### 기본 텍스트형 서비스알림

<div align="left"><img src="https://4039283399-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQs9TwojtGiGCik7kbIGR%2Fuploads%2FwkDSpHqNGqAA2Tgx0cmk%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-04-03%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%205.19.08.png?alt=media&#x26;token=e63f9a42-8cdc-4f62-b75b-d83afbdf96cb" alt="Untitled" width="334"></div>

```jsx
<https://api.officewave.co.kr/api/v1/hooks/{token}/notifications> / POST
{
    "whole": false,
    "to": ["example@jiran.com"],
    "contents": "컨텐츠입니다.",
    "template": "text",
    "type": "default"
}
```

<table><thead><tr><th width="111.2734375">필드</th><th width="84.3359375">속성</th><th width="121.4296875">필수여부</th><th width="178.3515625">설명</th><th width="281.45703125">예시</th></tr></thead><tbody><tr><td><code>whole</code></td><td>boolean</td><td>X</td><td>전체 전송 여부</td><td>false</td></tr><tr><td><code>to</code></td><td>array</td><td>whole이 false이거나 없는 경우 O</td><td>받는 대상 유저의 이메일 값</td><td>[”example1@jiran.com”, “example2@jiran.com”]</td></tr><tr><td><code>contents</code></td><td>string</td><td>O</td><td>서비스 알림의 본문 내용</td><td>“컨텐츠입니다.”</td></tr><tr><td><code>type</code></td><td>string</td><td>X</td><td>서비스 알림의 타입</td><td>“default”</td></tr><tr><td><code>template</code></td><td>string</td><td>X</td><td>서비스 알림의 레이아웃</td><td>“text”</td></tr></tbody></table>

### 버튼 텍스트형 서비스알림

<div align="left"><img src="https://4039283399-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQs9TwojtGiGCik7kbIGR%2Fuploads%2FyXuDinxAg8zSoZVOwbkx%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-04-03%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%205.26.05.png?alt=media&#x26;token=9b00cb27-dfa4-45f2-b262-6dc07b00e907" alt="Untitled" width="352"></div>

```jsx
<https://api.officewave.co.kr/api/v1/hooks/{token}/notifications> / POST
{
    "to": ["example@jiran.com"],
    "template": "text",
    "type": "static",
    "important": false,
    "items":
    {
        "header": "헤더입니다.",
        "contents" : "컨텐츠입니다.",
        "buttons": [
            {
                "label": "이미지1",
                "type" : "image",
                "href": "<https://source.unsplash.com/random/300*304>"
            },
            {
                "label": "이미지2",
                "type" : "image",
                "href": "<https://source.unsplash.com/random/300*305>"
            },
            {
                "label": "이미지3"
                "type" : "image",
                "href": "<https://source.unsplash.com/random/300*306>"
            }
        ],        "button_layout" : "vertical"
    }

}
```

<table><thead><tr><th width="151.90625">필드</th><th width="85.80859375">속성</th><th width="143.08984375">필수여부</th><th width="152.51171875">설명</th><th width="126.0546875">예시</th><th width="168.359375">비고</th></tr></thead><tbody><tr><td><code>whole</code></td><td>boolean</td><td>X</td><td>전체 전송 여부</td><td>false</td><td></td></tr><tr><td><code>to</code></td><td>array</td><td>whole이 false이거나 없는 경우 O</td><td>받는 대상 유저의 이메일 값</td><td>[”example1@jiran.com”, “example2@jiran.com”]</td><td></td></tr><tr><td><code>type</code></td><td>string</td><td>X</td><td>서비스 알림의 타입</td><td>“default”</td><td></td></tr><tr><td><code>template</code></td><td>string</td><td>X</td><td>서비스 알림의 레이아웃</td><td>“text”</td><td></td></tr><tr><td><code>items</code></td><td>array</td><td>O</td><td>서비스 알림의 레이아웃 요소</td><td></td><td></td></tr><tr><td><code>items.header</code></td><td>string</td><td>X</td><td>text template의 header</td><td>“헤더입니다”</td><td>50자</td></tr><tr><td><code>items.contents</code></td><td>string</td><td>O</td><td>text template의 contents</td><td>“컨텐츠입니다”</td><td>1000자</td></tr><tr><td><code>items.buttons</code></td><td>array</td><td>X</td><td>text template의 버튼</td><td></td><td>버튼 최대 3개</td></tr><tr><td><code>items.buttons.label</code></td><td>string</td><td>O</td><td>버튼에 쓰여진 글자</td><td>“이미지 보기”</td><td>vertical: 14자 horizontal: 8자</td></tr><tr><td><code>items.buttons.type</code></td><td>string</td><td>O</td><td>버튼 타입</td><td>“image”</td><td>image, link, webview</td></tr><tr><td><code>items.buttons.href</code></td><td>string</td><td>O</td><td>버튼 클릭 했을 때 참조하는 링크 또는 코드 값</td><td>“<a href="https://source.unsplash.com/random/300*300">https://source.unsplash.com/random/300*300</a>"</td><td></td></tr><tr><td><code>items.button_layout</code></td><td>string</td><td>X</td><td>버튼 배치방식</td><td>“vertical”</td><td>vertical, horizontal</td></tr></tbody></table>

### 버튼 카드형 서비스알림

![](https://4039283399-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQs9TwojtGiGCik7kbIGR%2Fuploads%2Ft91v9BoPtaU0cwKlY6Bg%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-04-03%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%205.51.26.png?alt=media&token=25e4e9e1-283c-4692-b7dc-568a15242400)

```jsx
<https://api.officewave.co.kr/api/v1/hooks/{token}/notifications> / POST
{
    "to": ["example@jiran.com"],
    "template": "list",
    "type": "static",
    "important": false,
    "items":
    {
        "header": "헤더입니다.",
        "items": [
            {
                "image_url": "<https://source.unsplash.com/random/301*300>",
                "title" : "이미지1",
                "contents" : "컨텐츠1",
                "type": "image",
                "href": "<https://source.unsplash.com/random/302*300>"
            },
            {
                "image_url": "<https://source.unsplash.com/random/303*300>",
                "title" : "이미지2",
                "contents" : "컨텐츠2",
                "type": "image",
                "href": "<https://source.unsplash.com/random/304*300>"
            },
            {
                "image_url": "<https://source.unsplash.com/random/305*300>",
                "title" : "이미지3",
                "contents" : "컨텐츠3",
                "type": "image",
                "href": "<https://source.unsplash.com/random/306*300>"
            }
        ],
        "buttons": [
            {
                "label": "이미지1",
                "type" : "image",
                "href": "<https://source.unsplash.com/random/307*300>"
            },
            {
                "label": "이미지2",
                "type" : "image",
                "href": "<https://source.unsplash.com/random/308*300>"
            },
            {
                "label": "이미지3",
                "type" : "image",
                "href": "<https://source.unsplash.com/random/309*300>"
            }
        ],
        "button_layout" : "vertical"
    }
}
```

<table><thead><tr><th width="143.203125">필드</th><th width="95.515625">속성</th><th width="127.39453125">필수여부</th><th width="145.58984375">설명</th><th width="125.20703125">예시</th><th>비고</th></tr></thead><tbody><tr><td><code>whole</code></td><td>boolean</td><td>X</td><td>전체 전송 여부</td><td>false</td><td></td></tr><tr><td><code>to</code></td><td>array</td><td>whole이 false이거나 없는 경우 O</td><td>받는 대상 유저의 이메일 값</td><td>[”example1@jiran.com”, “example2@jiran.com”]</td><td></td></tr><tr><td><code>type</code></td><td>string</td><td>X</td><td>서비스 알림의 타입</td><td>“default”</td><td></td></tr><tr><td><code>template</code></td><td>string</td><td>X</td><td>서비스 알림의 레이아웃</td><td>“text”</td><td></td></tr><tr><td><code>items</code></td><td>array</td><td>O</td><td>서비스 알림의 레이아웃 요소</td><td></td><td></td></tr><tr><td><code>items.header</code></td><td>string</td><td>O</td><td>list template의 header</td><td>“헤더입니다.”</td><td>50자</td></tr><tr><td><code>items.items</code></td><td>array</td><td>O</td><td>list template의 요소</td><td></td><td>static 타입인 경우 최대 5개</td></tr><tr><td><code>items.items.image_url</code></td><td>string</td><td>X</td><td>list template의 이미지 url</td><td>“<a href="https://source.unsplash.com/random/300*300%E2%80%9D">https://source.unsplash.com/random/300*300”</a></td><td></td></tr><tr><td><code>items.items.title</code></td><td>string</td><td>O</td><td>list template의 제목</td><td>“타이틀1입니다.”</td><td>50자</td></tr><tr><td><code>items.items.contents</code></td><td>string</td><td>X</td><td>list template의 내용</td><td>“컨텐츠1입니다.”</td><td>200자</td></tr><tr><td><code>items.items.type</code></td><td>string</td><td>href 있으면 O</td><td>list template의 클릭 타입</td><td>“image”</td><td>image, link</td></tr><tr><td><code>items.items.href</code></td><td>string</td><td>type 있으면 O</td><td>list template의 클릭 시 참조하는 링크 또는 코드 값</td><td>“<a href="https://source.unsplash.com/random/300*300%E2%80%9D">https://source.unsplash.com/random/300*300”</a></td><td></td></tr><tr><td><code>items.buttons</code></td><td>array</td><td>X</td><td>card template의 버튼</td><td></td><td>버튼 최대 3개</td></tr><tr><td><code>items.buttons.label</code></td><td>string</td><td>O</td><td>버튼에 쓰여진 글자</td><td>“이미지1”</td><td>vertical : 14자 horizontal : 8자</td></tr><tr><td><code>items.buttons.type</code></td><td>string</td><td>O</td><td>버튼 타입</td><td>“image”</td><td>image, link, webview</td></tr><tr><td><code>items.buttons.href</code></td><td>string</td><td>O</td><td>버튼 클릭 했을 때 참조하는 링크 또는 코드 값</td><td>“<a href="https://source.unsplash.com/random/300*300%E2%80%9D">https://source.unsplash.com/random/300*300”</a></td><td></td></tr><tr><td><code>items.button_layout</code></td><td>string</td><td>X</td><td>버튼 배치방식</td><td>“vertical”</td><td>vertical, horizontal</td></tr></tbody></table>

### 슬라이드 텍스트형 서비스알림

<div align="left"><figure><img src="https://4039283399-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQs9TwojtGiGCik7kbIGR%2Fuploads%2Fwvw6iM95ZlbY8dMewZIV%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-04-03%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%205.53.57.png?alt=media&#x26;token=3f0fb9f9-050b-4d6e-868f-2ca1b6cec741" alt="" width="375"><figcaption></figcaption></figure></div>

```jsx
<https://api.officewave.co.kr/api/v1/hooks/{token}/notifications> / POST
{
    "to": ["example@jiran.com"],
    "template": "text",
    "type": "carousel",
    "important": false,
    "items":
    [
        {
            "header": "헤더1",
            "contents" : "컨텐츠 1",
            "buttons": [
                {
                    "label": "이미지1",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/301*300>"
                },
                {
                    "label": "이미지2",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/302*300>"
                },
                {
                    "label": "이미지3",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/303*300>"
                }
            ]
        },
        {
            "header": "헤더2",
            "contents" : "컨텐츠2",
            "buttons": [
                {
                    "label": "이미지1",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/304*300>"            },
                {
                    "label": "이미지2",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/200*300>"
                },
                {
                    "label": "이미지3",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/100*300>"
                }
            ]
        },
        {
            "header": "헤더3",
            "contents" : "컨텐츠3",
            "buttons": [
                {
                    "label": "naver",
                    "type" : "link",
                    "href": "<http://www.naver.com>"
                },
                {
                    "label": "google",
                    "type" : "link",
                    "href": "<http://www.google.com>"
                },
                {
                    "label": "stackoverflow",
                    "type" : "link",
                    "href": "<https://stackoverflow.com/>"
                }
            ],
            "button_layout" : "vertical"
        }
    ]
}
```

<table><thead><tr><th width="138.54296875">필드</th><th width="95.015625">속성</th><th>필수여부</th><th>설명</th><th>예시</th><th>비고</th></tr></thead><tbody><tr><td><code>whole</code></td><td>boolean</td><td>X</td><td>전체 전송 여부</td><td>false</td><td></td></tr><tr><td><code>to</code></td><td>array</td><td>whole이 false이거나 없는 경우 O</td><td>받는 대상 유저의 이메일 값</td><td>[”example1@jiran.com”, “example2@jiran.com”]</td><td></td></tr><tr><td><code>type</code></td><td>string</td><td>X</td><td>서비스 알림의 타입</td><td>“default”</td><td></td></tr><tr><td><code>template</code></td><td>string</td><td>X</td><td>서비스 알림의 레이아웃</td><td>“text”</td><td></td></tr><tr><td><code>items</code></td><td>array</td><td>O</td><td>서비스 알림의 레이아웃 요소</td><td></td><td></td></tr><tr><td><code>items.*.header</code></td><td>string</td><td>X</td><td>text template의 header</td><td>“헤더입니다”</td><td>50자</td></tr><tr><td><code>items.*.contents</code></td><td>string</td><td>O</td><td>text template의 contents</td><td>“컨텐츠입니다”</td><td>1000자</td></tr><tr><td><code>items.*.buttons</code></td><td>array</td><td>X</td><td>text template의 버튼</td><td></td><td>버튼 최대 3개</td></tr><tr><td><code>items.*.buttons.label</code></td><td>string</td><td>O</td><td>버튼에 쓰여진 글자</td><td>“이미지”</td><td></td></tr><tr><td><code>items.*.buttons.type</code></td><td>string</td><td>O</td><td>버튼 타입</td><td>“image”</td><td>image, link, webview</td></tr><tr><td><code>items.*.buttons.href</code></td><td>string</td><td>O</td><td>버튼 클릭 했을 때 참조하는 링크 또는 코드 값</td><td>“<a href="https://source.unsplash.com/random/300*300">https://source.unsplash.com/random/300*300</a>"</td><td></td></tr><tr><td><code>items.*.button_layout</code></td><td>string</td><td>X</td><td>버튼 배치방식</td><td>“vertical”</td><td>vertical 고정</td></tr></tbody></table>

### 슬라이드 카드형 서비스알림

<div align="left"><img src="https://4039283399-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQs9TwojtGiGCik7kbIGR%2Fuploads%2F58K6oTNXBIuktkC6iIYg%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-04-03%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%205.52.58.png?alt=media&#x26;token=c1f33981-4bfa-4516-89bf-1e5e721a27fa" alt="Untitled" width="375"></div>

```jsx
<https://api.officewave.co.kr/api/v1/hooks/{token}/notifications> / POST
{
    "to": ["example@jiran.com"],
    "template": "card",
    "type": "carousel",
    "important": false,
    "items":
    [
        {
            "title" : "타이틀1",
            "contents" : "컨텐츠1",
            "image_url": "<https://source.unsplash.com/random/600*300>",
            "buttons": [
                {
                    "label": "이미지1",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/311*300>"
                },
                {
                    "label": "이미지2",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/310*300>"
                },
                {
                    "label": "이미지3",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/312*300>"
                }
            ],
            "button_layout" : "vertical"
        },
        {
            "title" : "타이틀2",
            "contents" : "컨텐츠2",
            "image_url": "<https://source.unsplash.com/random/500*300>",
            "buttons": [
                {
                    "label": "이미지1",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/313*300>"            },
                {
                    "label": "이미지2",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/213*300>"
                },
                {
                    "label": "이미지3",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/113*300>"
                }
            ],
            "button_layout" : "vertical"
        },
        {
            "title" : "타이틀3",
            "contents" : "컨텐츠3",
            "image_url": "<https://source.unsplash.com/random/414*300>",
            "buttons": [
                {
                    "label": "naver",
                    "type" : "link",
                    "href": "<http://www.naver.com>"
                },
                {
                    "label": "google",
                    "type" : "link",
                    "href": "<http://www.google.com>"
                },
                {
                    "label": "stackoverflow",
                    "type" : "link",
                    "href": "<http://stackoverflow.com>"
                }
            ],
            "button_layout" : "vertical"
        }
    ]
}
```

<table><thead><tr><th width="161.66015625">필드</th><th width="85.078125">속성</th><th>필수여부</th><th width="147.328125">설명</th><th>예시</th><th>비고</th></tr></thead><tbody><tr><td><code>whole</code></td><td>boolean</td><td>X</td><td>전체 전송 여부</td><td>false</td><td></td></tr><tr><td><code>to</code></td><td>array</td><td>whole이 false이거나 없는 경우 O</td><td>받는 대상 유저의 이메일 값</td><td>[”example1@jiran.com”, “example2@jiran.com”]</td><td></td></tr><tr><td><code>type</code></td><td>string</td><td>X</td><td>서비스 알림의 타입</td><td>“default”</td><td></td></tr><tr><td><code>template</code></td><td>string</td><td>X</td><td>서비스 알림의 레이아웃</td><td>“text”</td><td></td></tr><tr><td><code>items</code></td><td>array</td><td>O</td><td>서비스 알림의 레이아웃 요소</td><td></td><td></td></tr><tr><td><code>items.title</code></td><td>string</td><td>O</td><td>card template의 header</td><td>“헤더입니다”</td><td>100자</td></tr><tr><td><code>items.contents</code></td><td>string</td><td>X</td><td>card template의 contents</td><td>“컨텐츠입니다”</td><td>1000자</td></tr><tr><td><code>items.image_url</code></td><td>string</td><td>O</td><td>card template의 이미지 url</td><td>“<a href="https://source.unsplash.com/random/300*300%E2%80%9D">https://source.unsplash.com/random/300*300”</a></td><td></td></tr><tr><td><code>items.buttons</code></td><td>array</td><td>X</td><td>card template의 버튼</td><td></td><td>버튼 최대 3개</td></tr><tr><td><code>items.buttons.label</code></td><td>string</td><td>O</td><td>버튼에 쓰여진 글자</td><td>“이미지”</td><td></td></tr><tr><td><code>items.buttons.type</code></td><td>string</td><td>O</td><td>버튼 타입</td><td>“image”</td><td>image, link, webview</td></tr><tr><td><code>items.buttons.href</code></td><td>string</td><td>O</td><td>버튼 클릭 했을 때 참조하는 링크 또는 코드 값</td><td>“<a href="https://source.unsplash.com/random/300*300%E2%80%9D">https://source.unsplash.com/random/300*300”</a></td><td></td></tr><tr><td><code>items.button_layout</code></td><td>string</td><td>X</td><td>버튼 배치방식</td><td></td><td>vertical 고정</td></tr></tbody></table>

### 슬라이드 리스트형 서비스알림

<div align="left"><figure><img src="https://4039283399-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQs9TwojtGiGCik7kbIGR%2Fuploads%2FMujT8Ryq8Kil6AEfGwhS%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-04-03%20%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE%205.56.10.png?alt=media&#x26;token=cdf0fa76-febc-4504-b208-6dc78b89c799" alt="" width="375"><figcaption></figcaption></figure></div>

```jsx
<https://api.officewave.co.kr/api/v1/hooks/{token}/notifications> / POST
{
    "to": ["example@jiran.com"],
    "template": "list",
    "type": "carousel",
    "important": false,
    "items":
    [
        {
            "header": "헤더1",
            "items": [
                {
                    "image_url": "<https://source.unsplash.com/random/100*100>",
                    "title" : "타이틀1",
                    "contents" : "컨텐츠1",
                    "type": "image",
                    "href": "<https://source.unsplash.com/random/111*300>"
                },
                {
                    "image_url": "<https://source.unsplash.com/random/222*100>",
                    "title" : "타이틀2",
                    "contents" : "컨텐츠2",
                    "type": "image",
                    "href": "<https://source.unsplash.com/random/300*345>"
                },
                {
                    "image_url": "<https://source.unsplash.com/random/333*100>",
                    "title" : "타이틀3",
                    "contents" : "컨텐츠3",
                    "type": "image",
                    "href": "<https://source.unsplash.com/random/300*346>"
                },
                {
                    "image_url": "<https://source.unsplash.com/random/444*200>",
                    "title" : "타이틀4",
                    "contents" : "컨텐츠4",
                    "type": "image",
                    "href": "<https://source.unsplash.com/random/300*347>"
                }
            ],
            "buttons": [
                {
                    "label": "이미지1",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/300*348>"
                },
                {
                    "label": "이미지2",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/300*349>"
                },
                {
                    "label": "이미지3",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/300*351>"
                }
            ],
            "button_layout" : "vertical"
        },
        {
            "header": "헤더2",
            "items": [
                {
                    "image_url": "<https://source.unsplash.com/random/555*100>",
                    "title" : "이미지1",
                    "contents" : "컨텐츠1",
                    "type": "image",
                    "href": "<https://source.unsplash.com/random/666*101>"
                },
                {
                    "image_url": "<https://source.unsplash.com/random/777*200>",
                    "title" : "이미지2",
                    "contents" : "컨텐츠2",
                    "type": "image",
                    "href": "<https://source.unsplash.com/random/150*102>"
                },
                {
                    "image_url": "<https://source.unsplash.com/random/151*300>",
                    "title" : "이미지3",
                    "contents" : "컨텐츠3",
                    "type": "image",
                    "href": "<https://source.unsplash.com/random/152*103>"
                }
            ],
            "buttons": [
                {
                    "label": "이미지4",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/153*104>"
                },
                {
                    "label": "이미지5",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/154*105>"
                },
                {
                    "label": "이미지6",
                    "type" : "image",
                    "href": "<https://source.unsplash.com/random/155*106>"
                }
            ],
            "button_layout" : "vertical"
        },
        {
            "header": "헤더3",
            "items": [
                {
                    "image_url": "<https://source.unsplash.com/random/156*301>",
                    "title" : "naver",
                    "contents" : "컨텐츠1",
                    "type": "link",
                    "href": "<http://www.naver.com>"
                },
                {
                    "image_url": "<https://source.unsplash.com/random/157*302>",
                    "title" : "google",
                    "contents" : "컨텐츠2",
                    "type": "link",
                    "href": "<http://www.google.com>"
                },
                {
                    "image_url": "<https://source.unsplash.com/random/158*303>",
                    "title" : "so",
                    "contents" : "컨텐츠3",
                    "type": "link",
                    "href": "<http://stackoverflow.com>"
                }
            ],
            "buttons": [
                {
                    "label": "Naver",
                    "type" : "link",
                    "href": "<http://www.naver.com>"
                },
                {
                    "label": "google",
                    "type" : "link",
                    "href": "<http://www.google.com>"
                },
                {
                    "label": "stackoverflow",
                    "type" : "link",
                    "href": "<http://stackoverflow.com>"
                }
            ],
            "button_layout" : "vertical"
        }
    ]
}
```

| 필드                      | 속성    | 필수여부                        | 설명                                               | 예시                                                                                                 | 비고                     |
| ------------------------- | ------- | ------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| `whole`                   | boolean | X                               | 전체 전송 여부                                     | false                                                                                                |                          |
| `to`                      | array   | whole이 false이거나 없는 경우 O | 받는 대상 유저의 이메일 값                         | \[”<example1@jiran.com>”, “<example2@jiran.com>”]                                                    |                          |
| `type`                    | string  | X                               | 서비스 알림의 타입                                 | “default”                                                                                            |                          |
| `template`                | string  | X                               | 서비스 알림의 레이아웃                             | “text”                                                                                               |                          |
| `items`                   | array   | O                               | 서비스 알림의 레이아웃 요소                        |                                                                                                      |                          |
| `items.*.header`          | string  | O                               | list template의 header                             | “헤더입니다.”                                                                                        | 50자                     |
| `items.*.items`           | array   | O                               | list template의 요소                               |                                                                                                      | carousel인 경우 최대 4개 |
| `items.*.items.image_url` | string  | X                               | list template의 이미지 url                         | “[https://source.unsplash.com/random/300\*300”](https://source.unsplash.com/random/300*300%E2%80%9D) |                          |
| `items.*.items.title`     | string  | O                               | list template의 제목                               | “타이틀1입니다.”                                                                                     | 50자                     |
| `items.*.items.contents`  | string  | X                               | list template의 내용                               | “컨텐츠1입니다.”                                                                                     | 200자                    |
| `items.*.items.type`      | string  | href 있으면 O                   | list template의 클릭 타입                          | “image”                                                                                              | image, link              |
| `items.*.items.href`      | string  | type 있으면 O                   | list template의 클릭 시 참조하는 링크 또는 코드 값 | “[https://source.unsplash.com/random/300\*300”](https://source.unsplash.com/random/300*300%E2%80%9D) |                          |
| `items.*.buttons`         | array   | X                               | card template의 버튼                               |                                                                                                      | 버튼 최대 3개            |
| `items.*.buttons.label`   | string  | O                               | 버튼에 쓰여진 글자                                 | “이미지1”                                                                                            |                          |
| `items.*.buttons.type`    | string  | O                               | 버튼 타입                                          | “image”                                                                                              | image, link, webview     |
| `items.*.buttons.href`    | string  | O                               | 버튼 클릭 했을 때 참조하는 링크 또는 코드 값       | “[https://source.unsplash.com/random/300\*300”](https://source.unsplash.com/random/300*300%E2%80%9D) |                          |
| `items.*.button_layout`   | string  | X                               | 버튼 배치방식                                      | “vertical”                                                                                           | vertical 고정            |

- href는 버튼을 클릭 했을 때 참조하는 링크 또는 코드 값입니다.

### 버튼 레이아웃

- horizontal

<div align="left"><figure><img src="https://4039283399-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQs9TwojtGiGCik7kbIGR%2Fuploads%2FiKAy5jxZQr7j02H9pu4L%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-04-04%20%E1%84%8B%E1%85%A9%E1%84%8C%E1%85%A5%E1%86%AB%2010.01.32.png?alt=media&#x26;token=8127fa3d-b7fb-4f4f-ad73-6dc24997bf40" alt="" width="375"><figcaption></figcaption></figure></div>

- vertical

<div align="left"><figure><img src="https://4039283399-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FQs9TwojtGiGCik7kbIGR%2Fuploads%2FBgnjs6t1ouw7prFQkP8h%2F%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA%202025-04-04%20%E1%84%8B%E1%85%A9%E1%84%8C%E1%85%A5%E1%86%AB%2010.02.13.png?alt=media&#x26;token=7cb232aa-83a1-4cdf-8d6e-d4a3441fdae6" alt="" width="375"><figcaption></figcaption></figure></div>

- 버튼 레이아웃의 제한사항은 다음과 같습니다.

1. "vertical" (세로배치) 혹은 "horizontal" (가로배치) 만 입력 가능합니다.

2. 단일형만 button layout 설정 가능, 케로셀형은 세로배치 고정입니다.

3. 단일형에서 별도 지정하지 않는 경우 버튼 개수에 따라 배치모양이 결정됩니다. 2개 이하: 가로배치 3개: 세로 배치

4. 버튼 레이아웃에 따른 버튼명 글자 수 제한은 다음과 같습니다. vertical 레이아웃 : button label 14자, horizontal 레이아웃 : button label 8자

5. 레이아웃에 따른 버튼명 글자 수 제한은 다음과 같습니다. vertical 레이아웃 : button label 14자, horizontal 레이아웃 : button label 8자

#### 사이즈 제한

| type              | template | 속성     | **사이즈 제한** |
| ----------------- | -------- | -------- | --------------- |
| static / carousel | text     | header   | 50자            |
| static / carousel | text     | contents | 1,000자         |
| static / carousel | card     | title    | 100자           |
| static / carousel | card     | contents | 1,000자         |
| static / carousel | list     | header   | 50자            |
| static / carousel | list     | title    | 50자            |
| static / carousel | list     | contents | 200자           |

글자수 제한을 넘어서도 요청을 받지 않는게 아닌 저 글자수만큼만 잘라서 처리합니다.

### 상태 코드

HTTP 응답 코드는 일반적인 성공과 오류 클래스를 나타내는 데 사용됩니다.

#### 성공 코드

| HTTP **상태** | **설명**               |
| ------------- | ---------------------- |
| 200           | 성공적으로 처리된 요청 |

#### 오류 코드

| HTTP **상태명** | `code`            | `message`                          |
| --------------- | ----------------- | ---------------------------------- |
| 403             | invalid_request   | 잘못된 요청입니다.                 |
| 410             | invalid_contract  | 유효하지 않는 계약입니다.          |
| 419             | invalid_token     | 만료된 토큰입니다.                 |
| 422             | invalid_parameter | 유효하지 않는 요청 파라미터입니다. |
