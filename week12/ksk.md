# 2 콜백
어떤 경우든 함수는 콜백 역할을 함  
큐에서 대기 중인 코드가 처리되자마자 본 프로그램으로 '되돌아올' 목적지기 때문  
콜백은 자바스크립트에서 비동기성을 표현하고 관리하는 가장 일반적인 기법이자, 사실상 자바스크립트 언어에서 가장 기본적인 비동기 패턴  

## 2.1 연속성
```javascript
// A
ajax("..", function(..) {
  // C
});
// B
```
A와 B는 프로그램 전반부(지금), C는 프로그램 후반부(나중)  
전반부 코드가 곧장 실행되면 비결정적 시간 동안 중지되고 언젠가 AJAX 호출이 끝날 때 중지되기 이전 위치로 다시 돌아와서 나머지 후반후 프로그램이 이어짐  
다시 말해, 콜백 함수는 프로그램의 연속성을 감싼(캡슐화한) 장치  

```javascript
// A
setTimeout(function() {
  // C
}, 1000);
// B
```
A 실행 후 1000밀리 초 타임아웃을 설정하고 타임아웃 시 C를 실행  
vs.
A 실행 후 1000밀리 초 타임아웃을 설정하고 B 실행 후 타임아웃 시 C를 실행  

## 2.2 두뇌는 순차적이다

### 2.2.1 실행 vs 계획
상위수준의 사고(계획)는 형태만 보면 비동기 이벤트처럼 보이지 않음  
할 일을 차례대로 계획한 다음, A가 끝날 때까지 B를 강제로 기다리게 하고 B가 끝날 때까지 C를 강제로 기다리게 하는 식으로 잠정적인 중단을 함  

문과 문이 이어진 동기 코드
```javascript
// (임시 변수 'z'를 통해) 'x'와 'y'를 교환
z = x;
x = y;
y = z;
```
x = y가 z = x가 끝날 때 까지 기다리고 y = z가 x = y가 끝날 때까지 기다리는 동기 코드  
어느 한 문이 끝나야 다른 문이 실행되는 특정한 순서로 흘러가도록 짜임  

비동기 코드 작성이 어려운 이유는 인간이 비동기 흐름을 생각하고 떠올리는 일 자체가 부자연스럽기 때문  
인간은 단계별로 끊어 생각하는 경향이 있는데, 동기 -> 비동기로 전환된 이후로는 단계별로 나타내기가 쉽지 않음  

### 2.2.2 중첩/연쇄된 콜백
```javascript
listen("click", function handler(evt) {
  setTimeout(function request() {
    ajax("http://some.url.1", function response(text) {
      if (text == "hello") {
        handler();
      } else if (text == "world") {
        request();
      }
    })
  }, 500);
})
```
비동기 단계(작업, 프로세스)를 3개의 함수가 중첨된 형태로 표현  
콜백 지옥, 운명의 피라미드  
콜백 지옥은 중첩/들여쓰기와는 무관하고 더 심각한 문제가 존재  

클릭 이벤트 대기 -> 타이머 작동까지 대기 -> ajax 응답을 받을 때까지 대기 순으로 진행, 이후 처음부터 되풀이  

순차적 두뇌 계획과 자연스럽게 잘 조화되는 것처럼 보임  
'지금'
```javascript
listen("..", function handler(..) {
  //..
});
```
'나중'
```javascript
setTimeout(function request(..) {
  //..
}, 500);
```
더 '나중'
```javascript
ajax("..", function response(..) {
  //..
});
```
가장 '나중'
```javascript
if(..) {
  //..
} else ..
```
위 선형적인 추론의 문제점
단순히 순차 실행될 경우는 많은 경우의 수 중 하나에 불과  
실제 비동기 자바스크립트 프로그램에는 갖가지 잡음이 섞임  

뚜렷하지는 않으나 더 심각한 오류
```javascript
doA(function() {
  doB();
  doC(function() {
    doD();
  });
  doE();
});
doF();
```
코드의 실행 순서
- doA()
- doF()
- doB()
- doC()
- doE()
- doD()

알파뱃순과 실행 순서를 일치시켜서 재작성한 코드
```javascript
doA(function() {
  doC();
  doD(function() {
    doF();
  });
  doE();
});
doB();
```
만약 doA()나 doD()가 비동기가 아니라면 A->C->D->F->E->B 순  

중첩은 비동기 흐름을 따라가기 어렵게 만드는 원인 중 하나  
중첩 없이 다시 작성한 이전 예제 코드
```javascript
listen("click", handler);
function handler() {
  setTimeout(request, 500);
}
function request() {
  ajax("http://some.url.1", response);
}
function response(text) {
  if (text == "hello") {
    handler();
  } else if (text == "world") {
    request();
  }
}
```
중첩/들여쓰기로 도배된 코드보다는 알아보기 쉬우나 여전히 콜백 지옥에 취약  

선형적인 추론 - 함수에서 다음 함수로, 또 그 다음 함수로, 시퀀스 흐름을 '따라가기' 위해 코드 베이스 전체를 널뛰기해야 함  
그나마 예제는 최고의 경우를 가정한 단순한 코드  
실무에서는 더 복잡한 경우가 많아 추론이 더 어려움  

단계 선행 고정 조건이 있을 때 하드 코딩이 나쁜 선택이라고 할 수는 없음  
그러나 하드 코딩은 기본적으로 부실한 코드를 양산하기에 단계가 나아가는 도중의 오류까지 대비할 수는 없음  
모든 내용을 단계별 하드 코딩하는 방법도 가능하지만 대부분 다른 단계나 비동기 흐름에서는 재사용할 수 없는, 매우 반복적인 코드 낭비가 초래됨  

수작업으로 하드 코딩한 콜백에서 만일의 사태와 가능한 경우의 수를 모두 나열한다면 코드가 지나치게 복잡해져서 관리와 수정이 어려워짐  

## 2.3 믿음성 문제
콜백의 또 다른 문제  
프로그램의 연속이란 관점에서 본 콜백 함수
```javascript
// A
ajax("..", function(..) {
  // C
});
// B
```
A와 B는 자바스크립트 메인 프로그램의 제어를 직접 받으며 '지금' 실행됨  
C는 다른 프로그램(ajax())의 제어하에 '나중'에 실행됨  
제어권 교환은 콜백 중심적 설계 방식의 가장 큰 문제점  

ajax()는 개발자가 작성하거나 직접 제어할 수 있는 함수가 아니라 서드 파티가 제공하는 유틸리티인 경우가 대부분  
제어의 역전 - 내가 작성하는 프로그램인데도 실행 흐름은 서드 파티에 의존해야 하는 상황  

### 2.3.1 다섯 마리 콜백 이야기
제어권 교환 예시  
고가 TV 판매 쇼핑몰 전자상거래 결제 시스템 구축  
현재 결제 시스템에는 많은 페이지가 예전부터 구축되어 서비스 중  
마지막 페이지에서 TV를 구매하려는 고객이 '확인' 버튼을 클릭하면 (분석 추적 솔루션을 만들어 납품하는 모 회사에서 제공한) 서드파티 함수를 호출하여 구매 정보를 추적할 수 있게 되어 있음  
성능 문제 때문에 비동기 방식으로 코딩됨 - 호출 시 콜백 함수를 같이 넘겨야 함  
콜백 함수가 시작되면 고객의 신용 카드를 결제하고 감사 페이지로 이동하는 코드가 잇따라 실행됨
```javascript
analytics.trackPurchase(purchaseData, function() {
  chargeCreditCard();
  displayThankyouPage();
});
```
한 사람의 고객이 TV를 구매했는데 같은 가격으로 5번 연속으로 결제된 상황  

추적 유틸리티가 콜백 함수를 한 번만 호출해야 하는데 다섯 차례 연달아 호출됨  
솔루션 업체가 납품한 코드 중 특정 조건에서 초당 한 번씩 주어진 콜백 함수를 호출하는데 최대 5초 동안 재시도하다 타임아웃 에러를 발생시키도록 만들어진 테스트 코드가 포함  
임시 수정
```javascript
var tracked = false;
analytics.trackPurchase(purchaseData, function() {
  if(!tracked) {
    tracked = true;
    chargeCreditCard();
    displayThankyouPage();
  }
});
```
만약 업체 측 함수가 콜백을 한 번도 호출하지 않는다면 문제 발생 가능성  
분석 유틸리티가 잘못 작동할 가능성이 있는 경우  
- (추적이 끝나기도 전에) 콜백을 너무 일찍 부름
- (아예 호출하지 않거나) 콜백을 너무 늦게 부름
- 콜백을 너무 적게 또는 너무 많이 부름
- 필요한 환경/인자를 정상적으로 콜백에 전달하지 못함
- 일어날지 모를 에러/예외를 무시  

### 2.3.2 남의 코드 뿐만 아니라
개발자는 예기치 못한 상황 방지하고 줄이기 위해 내부 함수 작성 시 입력 인자 체크를 통한 방어 로직을 추가함  
입력 인자를 믿는 경우
```javascript
function addnumbers(x, y) {
  // + 연산자는 인자를 문자열을 강제변환한 뒤 덧붙이는 형태로 오버로딩할 수 있기 때문에
  // 전달되는 값에 따라 항상 안전한 것은 아님
  return x + y;
}
addnumbers(21, 21); //42
addnumbers(21, "21"); //"2121"
```
방어 코드 추가
```javascript
function addnumbers(x, y) {
  // 인자가 숫자인지 확인
  if (typeof x != "number" || typeof y != "number") {
    throw Error("인자 오류");
  }
  return x + y;
}
addnumbers(21, 21); //42
addnumbers(21, "21"); //Error: "인자 오류"
```
```javascript
function addnumbers(x, y) {
  // 인자가 숫자인지 확인
  x = Number(x);
  y = Number(y);
  return x + y;
}
addnumbers(21, 21); //42
addnumbers(21, "21"); //42
```
이런 방식의 함수 입력값에 대한 체크/정규화 로직은 지극히 당연  
개발자 본인이 좌지우지할 수 있는 코드에 포함된 비동기 함수 호출에 대해서도 같은 원리를 적용해야 함  
그러나 콜백 자체는 도움이 되지 않음. 매번 비동기적으로 부를 때마다 콜백 함수에 반복적인 관용 코드/오버헤드를 넣는 식으로 손수 필요한 장치를 만들어야 함  
제어의 역전으로 빚어진 믿지 못할 코드를 완화할 장치가 없는 상황에서 콜백으로 코딩하면 버그를 심어놓는 것과 다름없음  

## 2.4 콜백을 구하라
기존 디자인을 변형한 콜백 체계  

에러 처리를 위한 분할 콜백 기능 제공 API - 한쪽은 성공 알림, 다른 쪽은 에러 알림
```javascript
function success(data) {
  console.log(data);
}
function failure(err) {
  console.error(err);
}
ajax("http://some.url.1", success, failure);
```
위와 같은 API 설계에서 에러 처리기 failure()는 필수가 아니며, 작성하지 않으면 에러는 무시됨  

에러 우선 스타일 콜백 패턴(노드 스타일. 대부분의 node.js API에서는 관용어)  
단일 콜백 함수는 에러 객체(오류 발생 시)를 첫 번째 인자로 받음  
성공 시 이 인자는 빈/falsy 객체로 채워지지만, 실패 시 truthy 또는 에러 객체로 세팅됨
```javascript
function response(err, data) {
  if(err) {
    console.error(err);
  } else {
    console.log(data);
  }
}
ajax("http://some.url.1", response);
```
믿음성 문제가 해결된 것처럼 보이지만 전혀 그렇지 않음  
원하지 않는 반복적 호출을 방지하거나 걸러내는 콜백 기능은 없음  
성공/에러 신호를 동시에 받거나 전혀 못 받을 수도 있으므로 상황별로 코딩해야 하는 부담까지 가중  
표준적 패턴의 모습을 띠고 있음에도 재사용 불가능한 장황한 관용 코드  

콜백을 한 번도 호출하지 않는 경우  
이벤트를 취소하는 타임아웃을 걸어놓아야 함
```javascript
function timeoutify(fn, delay) {
  var intv = setTimeout(function() {
    intv = null;
    fn(new Error("타임아웃!"));
  }, delay);
  return function() {
    if(intv) {
      clearTimeout(intv);
      fn.apply(this, arguments);
    }
  };
}
```
사용 방법
```javascript
function foo(err, data) {
  if(err) {
    console.error(err);
  } else {
    console.log(data);
  }
}
ajax("http://some.url.1", timeoutify(foo, 500));
```
너무 일찍 콜백을 호출하는 것은 부적절 - 애플리케이션 관점에서 보면 실제 어떤 중요한 작업을 마치기 전에 콜백을 부른 것  
유틸리티에 전달할 콜백을 지금(동기적) 또는 나중(비동기적)에 시작할 주체인 유틸리티에 문제가 있는 것  

```javascript
function result(data) {
  console.log(a);
}
var a = 0;

ajax("..미리 캐시된 URL..", result);
a++;
```
콘솔창 결과는 조건에 따라 다름 - 0(동기적 콜백 호출) / 1(비동기적 콜백 호출)  
프로그램의 위험성이 존재하기 때문에 항상 비동기로 가야 함  

주어진 API가 항상 비동기로 작동할지 확신이 없는 경우
```javascript
function asyncify(fn) {
  var orig_fn = fn;
  var intv = setTimeout(function() {
    intv = null;
    if(fn) fn();
  }, 0);
  fn = null;
  return function() {
    // 비동기 차례를 지나갔다는 사실을 나타내기 위해
    // 'intv' 타이머가 기동하기도 전에 시작
    if(intv) {
      fn = orig_fn.bind.apply(
        // 인자로 전달된 값들을 커링하면서
        // 감싸미의 'this'에 'bind()' 호출 인자를 추가
        [this].concat([].slice.call(arguments))
      );
    } else { // 이미 비동기
      // 원본 함수 호출
      orig_fn.apply(this, arguments);
    }
  };
}
```
사용법
```javascript
function result(data) {
  console.log(a);
}
var a = 0;
ajax("..미리 캐시된 URL..", result);
a++;
```
AJAX 요청을 캐시한 상태에서 즉각 콜백을 호출하여 귀결하거나, 데이터를 다른 곳에서 가져오기 때문에 나중에 비동기적으로 완료 - 결과값은 항상 1  
result()는 비동기적으로 부를 수밖에 없고 따라서 a++는 result()보다 먼저 실행됨