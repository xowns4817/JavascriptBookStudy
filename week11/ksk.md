# 1 비동기성: 지금과 나중

프로그램의 어느 부분은 '지금' 실행되고 다른 부분은 '나중에' 실행되면서 발생하는, 프로그램이 실제로 작동하지 않는 '지금'과 '나중' 사이의 간극에 관한 문제  
사용자 입력 대기, 데이터베이스/파일 시스템의 정보 조회, 네트워크를 경유한 데이터 송신 후 응답 대기, 일정한 시간 동안 반복적인 작업 수행(예: 애니메이션) 등 간극의 유형은 다양  
프로그램에서 '지금'에 해당하는 부분과 '나중'에 해당하는 부분 사이의 관계가 비동기 프로그램의 핵심  

## 1.1 프로그램 덩이
자바스크립트 프로그램은 .js 파일 하나로도 작성 가능하지만 보통은 여러 개의 덩이(chunk), 곧 '지금' 실행 중인 프로그램 덩이와 '나중'에 실행할 프로그램 덩이들로 구성됨  
함수 - 가장 일반적인 프로그램 덩이 단위  

'나중'은 '지금'의 직후가 아님  
'지금' 당장 끝낼 수 없는 작업은 비동기적으로 처리되므로 프로그램을 중단하지 않음
```javascript
var data = ajax("http://som.url.1");
console.log(data);
// ajax의 결과는 보통 이런 식으로는 data에 담을 수 없음
```
표준 AJAX 요청은 동기적으로 작동하지 않기 때문에 ajax() 함수의 결과값을 변수에 할당할 수 없음  
AJAX는 비동기적으로 '지금' 요청하고 '나중'에 결과를 받음  
콜백함수 - '지금'부터 '나중'까지 '기다리는' 가장 간단한(최적의) 방법
```javascript
ajax("http://some.url.1", function myCallbackFunction(data) {
  console.log(data);
});
```
콜백 문제를 피하기 위해 중단적/동기적 AJAX를 사용하는 행위는 정당화될 수 없음  

```javascript
function now() {
  return 21;
}
function later() {
  answer = answer * 2;
  console.log("인생의 의미:", answer);
}
//==========='지금' 덩이

var answer = now();
setTimeout(later, 1000);
//==========='나중' 덩이
```
프로그램 시작 시 '지금' 덩이는 바로 실행되지만 setTimeout()은 '나중' 이벤트를 설정하는 함수이므로 later() 함수는 나중에 실행됨  
코드 조각을 function으로 감싸놓고 이벤트에 반응하여 움직이게 하려면 '나중' 덩이를 코딩하여 프로그램에 '비동기성'을 부여하면 됨  

### 1.1.1 비동기 콘솔
console.* 메서드 - 명세에 작동 방법이나 요건에 따로 정해진 것은 아니지만 '호스팅 환경'에 추가된 기능  
-> 브라우저와 자바스크립트 실행 환경에 따라 작동 방식이 다르고 종종 혼동 유발  
console.log() 메서드는 브라우저 유형과 상황에 따라 출력 데이터가 마련된 직후에도 콘솔창에 표시되지 않을 수 있음 -> 많은 프로그램에서 I/O 부분이 가장 느리고 중단이 잦기 때문  
브라우저가 콘솔 I/O를 백그라운드에서 비동기적으로 처리해야 성능상 유리함
```javascript
var a = {
  index: 1
}
// 나중
console.log(a);
// 더 나중
a.index++;
```
개발자 도구 콘솔창에 { index: 1 }이 표시되겠지만 간혹 브라우저가 콘솔 I/O를 백그라운드로 전환하는 것이 좋겠다고 결정하면 출력이 지연될 수 있음  
a.index++가 먼저 실행된 후 콘솔창에 객체값이 전달되어 { index: 2 }로 나올 때가 있음  

## 1.2 이벤트 루프
ES6 이전까지 비동기라는 개념은 자바스크립트에 존재하지 않음 - 자바스크립트 엔진은 요청하면 프로그램을 주어진 시점에 한 덩이씩 실행할 뿐  

자바스크립트 엔진은 반드시 호스팅에서 실행됨(웹 브라우저가 가장 흔한 호스팅 환경)  
환경이 달라도 스레드는 공통 - 여러 프로그램 덩이를 시간에 따라 매 순간 한 번씩 엔진을 실행시키는 '이벤트 루프'  
즉, 자바스크립트 엔진은 시간 관념은 없었고 임의의 자바스크립트 코드 조각을 주는 대로 받아 처리하는 실행기일 뿐, '이벤트'를 스케줄링하는 일은 엔진을 감싸고 있던 주위 환경의 몫  

이벤트 루프
```javascript
// eventLoop: 큐 역할 배열
var eventLoop = [];
var event;

// 무한 실행
while(true) {
  // '틱' 발생
  if(eventLoop.length > 0) {
    // 큐에 있는 다음 이벤트 조회
    event = eventLoop.shift();
    // 다음 이벤트 실행
    try {
      event();
    } catch (err) {
      reportError(err);
    }
  }
}
```
틱 - while 무한 루프의 매 순회. 틱이 발생할 때마다 큐에 적재된 이벤트(콜백 함수)를 꺼내어 실행  
setTimeout()은 콜백을 이벤트 루프 큐에 넣지 않음 - 타이머를 설정하는 함수. 타이머가 끝나면 환경이 콜백을 이벤트 루프에 삽입한 뒤 틱에서 콜백을 꺼내어 실행함  

이벤트 루프가 원소로 가득 차 있을 경우, 일단 콜백을 기다림. 앞으로 가려 하지 않고 줄의 맨 끝에서 대기

자바스크립트 프로그램은 수많은 덩이로 잘게 나누어지고 이벤트 루프 큐에서 한 번에 하나씩 차례로 실행됨  
엄밀히 말해 이 큐엔 개발자가 작성한 프로그램과 직접 상관이 없는 이벤트들도 중간에 끼어들 가능성이 있음  

ES6부터 이벤트 루프 큐 관리 방식이 완전히 바뀜  
호스팅 환경이 아닌 자바스크립트 엔진이 관할함 - 프라미스 도입을 계기로 생긴 변화  
프라미스는 이벤트 루프 큐의 스케줄링을 직접 세밀하게 제어해야 하기 때문  

## 1.3 병렬 스레딩
비동기 - '지금'과 '나중 사이의 간극에 관한 용어  
병렬 - 동시에 일어나는 일들과 연관  

프로세스, 스레드 - 가장 많이 쓰는 병렬 컴퓨팅 도구. 별개의 프로세서, 물리적으로 분리된 컴퓨터에서도 독립적으로(혹은 동시에) 실행되며, 여러 스레드는 하나의 프로세스 메모리를 공유함  
이벤트 루프 - 작업 단위로 나누어 차례대로 실행하지만 공유 메모리에 병렬로 접근하거나 변경 불가  
병렬성과 직렬성이 나뉜 스레드에서 이벤트 루프를 협동하는 형태로 공존하는 모습  

병렬 실행 스레드 인터리빙과 비동기 이벤트 인터리빙 - 다른 수준의 단위에서 일어남
```javascript
function later() {
  answer = answer * 2;
  console.log("인생의 의미:", answer);
}
```
later() 함수의 전체 내용은 이벤트 루프 큐가 하나의 원소로 취급 - 여러 상이한 저수준의 작업들이 발생 가능  
예 - answer = answer * 2는 '현재 answer값 조회 -> 곱셈 연산 수행 -> 결과갑을 다시 answer 변수에 저장' 순으로 처리  

단일 스레드 환경에서는 스레드 간섭이 일어나지 않으므로 스레드 큐에 저수준 작업의 원소가 쌓여 있어도 문제가 없음  
그러나 하나의 프로그램에서 여러 스레드를 처리하는 병렬 시스템에서는 예상치 못한 일이 발생할 수 있음
```javascript
var a = 20;
function foo() {
  a = a + 1;
}
function bar() {
  a = a * 2;
}

ajax("http:some.url.1", foo);
ajax("http:some.url.2", bar);
```
foo() -> bar() 순서로 실행하면 결과값은 42(자바스크립트 단일-스레드 작동)  
bar() -> foo() 순서면 41  

같은 시점에 두 스레드가 실행되는 경우  
스레드 1
```
foo():
  a. 'a' 값을 'X'에 읽음
  b. '1'을 'Y'에 저장
  c. 'X'와 'Y'를 더하고 그 결과값을 'X'에 저장
  d. 'X' 값을 'a'에 저장
```
스레드2
```
bar():
  a. 'a' 값을 'X'에 읽음
  b. '2'을 'Y'에 저장
  c. 'X'와 'Y'를 곱하고 그 결과값을 'X'에 저장
  d. 'X' 값을 'a'에 저장
```
두 스레드가 병렬 상태로 실행될 시 문제 - X와 Y의 메모리 공간을 공유
```
1a('X'에서 'a' 값을 읽음 ==> '20')
2a('X'에서 'a' 값을 읽음 ==> '20')
1b('Y'에서 '1'을 저장 ==> '1')
2b('Y'에서 '2'을 저장 ==> '2')
1c('X'와 'Y'를 더하고 그 결과값을 'X'에 저장 ==> '22')
1d('a'에 'X'값을 저장 ==> '22')
2c('X'와 'Y'를 곱하고 그 결과값을 'X'에 저장 ==> '44')
2d('a'에 'X'값을 저장 ==> '44')
```
결과값은 44
```
1a('X'에서 'a' 값을 읽음 ==> '20')
2a('X'에서 'a' 값을 읽음 ==> '20')
2b('Y'에서 '2'을 저장 ==> '2')
1b('Y'에서 '1'을 저장 ==> '1')
2c('X'와 'Y'를 곱하고 그 결과값을 'X'에 저장 ==> '20')
1c('X'와 'Y'를 더하고 그 결과값을 'X'에 저장 ==> '21')
1d('a'에 'X'값을 저장 ==> '21')
2d('a'에 'X'값을 저장 ==> '21')
```
결과값은 21  

자바스크립트는 스레드 간 데이터 공유를 하지 않으므로 비결정성 수준이 문제가 되지 않지만 자바스크립트 프로그램이 항상 결정적이라는 의미는 아님  

### 1.3.1 완전-실행
자바스크립트 작동 모드는 단일 스레드 - foo()와 bar()의 내부 코드는 원자적(atomic)  
일단 foo()가 실행되면 이 함수 전체 코드가 실행되고 나서야 bar() 함수로 옮아감 => 완전-실행
```javascript
var a = 1;
var b = 2;

function foo() {
  a++;
  b = b * a;
  a = b + 3;
}

function bar() {
  b--;
  a = 8 + b;
  b = a * 2;
}

ajax("http:some.url.1", foo);
ajax("http:some.url.2", bar);
```
foo()와 bar()는 상대의 실행을 방해할 수 없으므로 프로그램의 결과값은 먼저 실행되는 함수가 좌우함  
만약 문 단위로 스레딩이 발생한다면 문별 인터리빙이 발생하여 경우의 수가 기하급수적으로 증가  

덩이1은 (지금 실행 중인) 동기 코드, 덩이 2와 3은 (나중에 실행될) 비동기 코드  
덩이1
```javascript
var a = 1;
var b = 2;
```
덩이2(foo())
```javascript
a++;
b = b * a;
a = b + 3;
```
덩이3(bar())
```javascript
b--;
a = 8 + b;
b = a * 2;
```
덩이2와 덩이3은 선발순으로 실행되므로 결과는 다음 중 하나  
결과1
```javascript
var a = 1;
var b = 2;

// foo()
a++;
b = b * a;
a = b + 3;

// bar()
b--;
a = 8 + b;
b = a * 2;

a; //11
b; //22
```
결과2
```javascript
var a = 1;
var b = 2;

// bar()
b--;
a = 8 + b;
b = a * 2;

// foo()
a++;
b = b * a;
a = b + 3;

a; //183
b; //180
```
똑같은 코드인데 결과값은 두 가지이므로 이 프로그램은 비결정적  
비결정성은 함수(이벤트)의 순서에 따른 것, 스레드처럼 문의 순서 수준까지는 아님. 즉, 스레드보다는 결정적  

경합 조건 - 자바스크립트에서 함수 순서에 따른 비결정성  
a와 b의 결과값을 예측할 수 없으므로 경합 조건임

## 1.4 동시성
사용자가 스크롤바를 아래로 내리면 계속 갱신된 상태 리스트가 화면에 표시되는 웹 페이지를 만드는 경우  
적어도 2개의 분리된 프로세스를 동시에(같은 시구간) 실행할 수 있어야 제대로 기능 구현 가능  
첫 번째 프로세스는 사용자가 페이지를 스크롤바로 내리는 순간 발생하는 onscroll 이벤트에 반응  
두 번째 프로세스는 ajax 응답을 받음(그리고 페이지에 데이터를 표시)  

동시성 - 복수의 프로세스가 같은 시간 동안 동시에 실행됨을 의미  
각 프로세스 작업들이 병렬로(별개의 프로세서/코어에서 같은 시점에) 처리되는지와는 관계없음  
동시성은 처리 수준 병행성(개별 프로세서의 스레드)과 상밴되는 개념의 '프로세스' 수준의 병행성  

주어진 시구간(사용자가 스크롤하는 2, 3초 정도의 시간) 동안 독립적인 각 프로세스를 이벤터/처리 목록으로 시각화하기  
프로세스 1 (onscroll 이벤트):
```javascript
onscroll, request 1
onscroll, request 2
onscroll, request 3
onscroll, request 4
onscroll, request 5
onscroll, request 6
onscroll, request 7
```
프로세스 2 (AJAX 응답 이벤트):
```javascript
response 1
response 2
response 3
response 4
response 5
response 6
response 7
```
onscroll 이벤트와 ajax 응답 이벤트는 동시에 발생할 수 있음  
예)시간에 따른 이벤트 나열
```javascript
onscroll, request 1
onscroll, request 2 response 1
onscroll, request 3 response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6 response 4
onscroll, request 7
response 6
response 5
response 7
```
그러나 이벤트 루프 개념상 자바스크립트는 한 번에 하나의 이벤트만 처리하므로 어느 한 쪽이 먼저 실행되고 정확히 같은 시각에 실행되는 일은 발생하지 않음  

이벤트 루프 큐에서의 이벤트 인터리빙
```javascript
onscroll, request 1   <--- 프로세스 1 시작
onscroll, request 2 
response 1            <--- 프로세스 2 시작
onscroll, request 3 
response 2
response 3
onscroll, request 4
onscroll, request 5
onscroll, request 6 
response 4
onscroll, request 7   <--- 프로세스 1 종료
response 6
response 5
response 7            <--- 프로세스 2 종료
```
프로세스 1과 프로세스 2는 동시에(작업 수준의 병행성) 실행되지만 이들을 구성하는 이벤트들은 이벤트 루프 큐에서 차례대로 실행됨  
단일 스레드 이벤트 루프는 동시성을 나타내는 하나의 표현 방식  

### 1.4.1 비상호 작용
어떤 프로그램 내에서 복수의 프로세스가 단계/이벤트를 동시에 인터리빙할 때 이들 프로세스 사이에 연관된 작업이 없다면 프로세스 간 상호작용은 의미가 없음  
프로세스 간 상호작용이 일어나지 않는다면 비결정성은 완벽하게 수용 가능
```javascript
var res = {};

function foo(results) {
  res.foo = results;
}

function bar(results) {
  res.bar = results;
}

ajax("http://some.url.1", foo);
ajax("http://some.url.2", bar);
```
foo()와 bar() 중 어떤 것이 먼저 실행될 지는 알 수 없지만 적어도 서로에게 아무런 영향을 끼치지 않고 개별 작동  

### 1.4.2 상호 작용
동시 프로세스들은 필요할 때 스코프나 DOM을 통해 간접적으로 상호 작용 -> 경합 조건이 발생하지 않도록 조율 필요  
암묵적인 순서에 의해 두 개의 동시 프로세스가 가끔 깨지는 예제
```javascript
var res = [];
function response(data) {
  res.push(data);
}

ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```
두 동시 프로세스 모두 ajax 응답 처리를 하는 response() 함수를 호출, 선발 순으로 처리됨  
어느 쪽 URL 응답이 먼저 도착하는지에 따라 처리되는 순서가 달라질 수 있음  
따라서 경합 조건 해결을 위해 상호 작용 순서의 조정 필요
```javascript
var res = [];
function response(data) {
  if(data.url == "http://some.url.1") {
    res[0] = data;
  } else if(data.url == "http://some.url.2") {
    res[1] = data;
  }
}

ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```
한꺼번에 여러 함수를 호출하는 형태로 공유 DOM을 통해 상호 작용하는 경우  
예: div 내용을 업데이트하는 함수와 div의 속성/스타일을 수정하는 함수 - 내용이 덜 채워진 DOM 요소가 화면에 보이는 것을 피하기 위해 조정 필요  
조정이 안될 경우 동시성이 문제가 될 수 있음
```javascript
var a, b;
function foo(x) {
  a = x * 2;
  baz();
}
function bar(y) {
  b = y * 2;
  baz();
}
function baz() {
  console.log(a + b);
}

ajax("http://some.url.1", foo);
ajax("http://some.url.2", bar);
```
foo(), bar() 중 어느 쪽이 먼저 실행되더라도 baz() 함수는 처음에 항상 빠르게 호출됨  
그러나 두 번째 실행할 때는 a, b 모두 값이 존재하므로 제대로 작동  
해결 예
```javascript
var a, b;
function foo(x) {
  a = x * 2;
  if(a && b) {
    baz();
  }
}
function bar(y) {
  b = y * 2;
  if(a && b) {
    baz();
  }
}
function baz() {
  console.log(a + b);
}

ajax("http://some.url.1", foo);
ajax("http://some.url.2", bar);
```
관문(gate) - if(a && b)와 같은 형태. a와 b 중 어떤 것이 먼저 도착할지 알 수 없으나 관문은 반드시 둘 다 도착한 다음에 열림  

경합 / 걸쇠(latch) - 선착순 하나만 이기는 형태  
비결정성을 수용하는 조건으로 결승선을 통과한 오직 한 명의 승자만 뽑는 '달리기 시합'을 명시적으로 선언하는 것  
잘못된 코드 예
```javascript
var a;
function foo(x) {
  a = x * 2;
  baz();
}
function bar(x) {
  a = x / 2;
  baz();
}
function baz() {
  console.log(a);
}

ajax("http://some.url.1", foo);
ajax("http://some.url.2", bar);
```
나중에 실행된 함수가 다른 함수가 할당한 값을 덮어쓸 뿐만 아니라 baz()를 한 번 더 호출  
걸쇠로 조정하여 선착순으로 변경
```javascript
var a;
function foo(x) {
  if(!a) {
    a = x * 2;
    baz();
  }  
}
function bar(x) {
  if(!a) {
    a = x / 2;
    baz();
  }
}
function baz() {
  console.log(a);
}

ajax("http://some.url.1", foo);
ajax("http://some.url.2", bar);
```
foo(), bar() 중 첫 번째 실행된 함수가 if(!a) 조건을 통과하고 두 번째 함수 호출은 무시됨

### 1.4.3 협동
협동적 동시성 - 동시성을 조정하는 다른 방안  
실행 시간이 오래 걸리는 프로세스를 여러 단계/배치로 쪼개어 다른 동시 프로세스가 각자 작업을 이벤트 루프 큐에 인터리빙 하도록 하는 것이 목표  

긴 리스트를 받아 값을 변환하는 ajax 응답 처리기를 가정
```javascript
var res = [];

function response(data) {
  // 기존 res 배열에 추가
  res = res.concat(
    data.map(function(val) {
      // 배열 원소를 하나씩 변환
      // 원래 값을 2배로 늘림
      return val * 2;
    });
  );
}

ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```
레코드 수가 늘어나면 처리 시간이 증가. 프로세스 실행 중에 페이지는 멈춰버림  
이벤트 큐를 독점하지 않는, 좀 더 친화적이고 협동적인 동시 시스템이 되기 위해 각 결과를 비동기 배치로 처리하고 이벤트 루프에서 대기 중이 다른 이벤트와 함께 실행되게끔 해야 함
```javascript
var res = [];

function response(data) {
  // 한 번에 1000개 씩 실행
  var chunk = data.splice(0, 1000);

  // 기존 res 배열에 추가
  res = res.concat(
    // 배열 원소를 하나씩 변환
    // chunk 값에 2를 곱함
    chunk.map(function(val) {
      return val * 2;
    });
  );
  // 처리해야 할 프로세스가 남은 경우
  if(data.length > 0) {
    // 다음 배치를 비동기 스케줄링
    setTimeout(function() {
      response(data);
    }, 0);
  }
}

ajax("http://some.url.1", response);
ajax("http://some.url.2", response);
```
최대 1000개의 원소를 가진 덩이 단위로 데이터 집합을 처리  
더 많은 후속 프로세스를 처리해야 하지만 각 프로세스 처리 시간은 단축되므로 이벤트 루프 큐에 인터리빙이 가능하고 응답성이 좋은 사이트/앱을 만들 수 있음  
프로세스들의 실행 순서까지 조정한 것은 아니므로 res 배열에 어떤 순서로 결과가 저장될지는 예측이 어려움  
순서가 중요한 경우라면 다른 방식을 같이 사용  
setTimeout(..., 0) - 비동기 스케줄링. "이 함수를 현재 이벤트 루프 큐의 맨 뒤에 붙일 것"의 의미

## 1.5 잡
잡 큐 - ES6부터 이벤트 루프 큐에 새롭게 도입된 개녕. 주로 프라미스의 비동기 작동에서 사용됨  
이벤트 루프 큐에서 '매 틱의 끝자락에 매달려 있는 큐'  
이벤트 루프 틱 도중 발생 가능한, 비동기 특성이 내재된 액션으로 인해 전혀 새로운 이벤트가 이벤트 루프 큐에 추가되는 게 아니라 현재 틱의 잡 큐 끝 부분에 원소(잡)가 추가됨  

잡은 같은 큐 끝에 더 많은 잡을 추가할 수 있는 구조 -> 잡 루프(계속 다른 잡으로 추가하는 잡)가 무한 반복되면서 프로그램이 다음 이벤트 루프 틱으로 이동할 기력을 상실할 수 있음  
개념저그올 프로그램이세 실행 시간이 긴 코드 도는 무한 루프를 표현한 것과 유사  

기본적으로 setTimeout(..., 0)의 의도와 비슷하지만 처리 순서가 더 잘 정의되어 있고 순서가 확실히 보장되는 방향으로 구현되어 있음  
잡 스케줄링 schedule() API
```javascript
console.log("A");

setTimeout(function() {
  console.log("B");
}, 0);

// 이론적인 "잡 API"
schedule(function() {
  console.log("C");

  schedule(function() {
    console.log("D");
  });
});
```
실행 결과는 A B C D가 아니라 A C D B  
잡은 '현재' 이벤트 루프 틱의 끝에서 시작하지만 타이머는 '다음' 이벤트 루프 틱에서 실행하도록 스케줄링하기 때문  

## 1.6 문 순서
자바스크립트 엔진은 반드시 프로그램에 표현된 문 순서대로 실행하지 않음  
```javascript
var a, b;
a = 10;
b = 30;

a = a + 1;
b = b + 1;
console.log(a + b); //42
```
```javascript
var a, b;

a = 10;
a++;

b = 30;
b++;

console.log(a + b); //42
```
```javascript
var a, b;
a = 11;
b = 31;

console.log(a + b); //42
```
```javascript
// 'a'와 'b'는 더 이상 쓰지 않으므로 할당값을 그냥 쓰기만 할 변수는 필요 없음
console.log(42); //42
```

어떤 경우라도 자바스크립트 엔진은 컴파일 과정에서 최종 결과가 뒤바뀌지 않도록 안전하게 최적화함  

그러나 안전하지 않아 최적화하면 안되는 경우도 있음
```javascript
var a, b;
a = 10;
b = 30;
console.log(a * b); //300

a = a + 1;
b = b + 1;
console.log(a + b); //42
```
부수 효과가 있는 함수 호출(특히 게터 함수), ES6 프록시 객체 등 컴파일러의 순서 조정으로 인해 현저한 부수 효과가 발생할 수 있음  
```javascript
function foo() {
  console.log(b);
  return 1;
}
var a, b, c;

// ES5.1 게터 리터럴 구문
c = {
  get bar() {
    console.log(a);
    return 1;
  }
};

a = 10;
b = 30;

a += foo();
b += c.bar; //11

console.log(a + b); //42
```
만약 console.log()가 없다면 자바스크립트 엔진은 다음과 같이 코드 순서를 변경
```javascript
//...

a = 10 + foo();
b = 30 += c.bar;

//...
```
소스 코드 순서(위->아래)와 컴파일 후 실행 순서는 사실상 아무 관련이 없음  
