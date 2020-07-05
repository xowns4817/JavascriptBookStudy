# 3 프라미스

콜백을 통한 비동기성 표현 및 동시성 - 순차성과 믿음성이 결여되는 결함  
프라미스를 통한 제어의 역전(믿음 소실) 해결 - 프로그램의 진행을 다른 파트에 넘겨주지 않고도 개발자가 언제 작업이 끝날지 알 수 있고 그 다음 무슨 일을 해야 할지 스스로 결정 가능 -> 제어의 역전을 되역전

## 3.1 프라미스란

### 3.1.1 미랫값

시나리오

- 동네 패스트 푸드점에서 카운터 점원에게 치즈버거 세트를 주문하고 결제, 거래 시작
- 주문이 밀려 버거가 즉시 나오지 않아서 점원은 치즈버거 대신 주문번호가 적힌 영수증을 전달. 주문 번호는 일종의 IOU로, 언젠가 반드시 치즈버거를 준다는 '프라미스(약속)'
- 영수증의 주문 번호는 치즈버거의 자리 끼움(placeholder) - 시간 독립적인 값, 즉 미래값
- 점원이 주문 번호를 말하면 영수증을 돌려주고 치즈버거 세트를 받음
- 미래값이 준비되어 갖고 있던 '값-프라미스'를 값 자체와 교환한 것
- 재료 소진에 의해 주문한 치즈버거 세트 수령 불가 - 미래값은 성공 아니면 실패

#### 지금값과 나중값

미래값을 다루는 방법(콜백)

숫자 계산 등 어떤 값을 내는 코드 - '지금' 존재하는 구체적인 값

```javascript
var x,
  y = 2;
console.log(x + y); // NaN <- x는 아직 세팅 전
```

x + y 연산 시 당연히 x, y 모두 이미 세팅된 값이라고 간주(x, y 값은 이미 '귀결됨')  
상이한 문 중 어떤 문은 '지금' 실행되고 다른 문은 '나중'에 실행되면 프로그램의 혼돈 유발  
두 문 중 한쪽(또는 둘 다)이 아직 실행 중이라면 - 1번 문이 끝나고 나서 2번 문이 실행ㄷ되는 조건이면 1번 문이 '지금' 바로 끝나 순조롭게 흘러가든지, 1번 문이 미처 끝나지 않아 2번 문은 결국 실패하든지 두 경우 중 하나

```javascript
function add(getX, getY, cb) {
  var x, y;
  getX(function (xVal)) {
    x = xVal;
    // 둘 다 준비됐나
    if(y != undefined) {
      cb(x + y);
    }
  });
  getY(function (yVal)) {
    y = yVal;
    // 둘 다 준비됐나
    if(x != undefined) {
      cb(x + y);
    }
  });
}

// 'fetchX()'와 'fetchY()'는 동기/비동기 함수
add(fetchX, fetchY, function(sum) {
  console.log(sum);
});
```

x, y는 모두 미래값으로 취급 - add() 함수 입장에서 x, 또는 y의 값이 지금 준비된 상태인지는 관심 밖  
'지금'과 '나중'을 정규화한 결과, add()의 처리 결과를 예측할 수 있게 바뀐 것  
시간에 대해 한결같은('지금'과 '나중'에 걸친 어느 때라도 똑같이 움직이는) add() 덕분이 비동기 코드가 추론하기 편해짐

'지금'과 '나중'을 모두 일관적으로 다루려면 둘 다 '나중'으로 만들어 모든 작업을 비동기화하면 됨

#### 프라미스 값

x + y 예제를 프라미스 함수로 나타내기

```javascript
function add(xPromise, yPromise) {
  // 'Promise.all([])': 프라미스 배열을 인자로 받아 프라미스들이 모두 귀결될 때가지 기다렸다가 새 프라미스를 만들어 반환하는 함수
  return Promise.all([xPromise, yPromise]);
  // 프라미스가 귀결되면 'X'와 'Y' 값을 받아 더함
  .then(function(values) {
    // 'values'는 앞에서 귀결된 프라미스가 건네준 메시지 배열
    return values[0] + values[1];
  });
}

// 'fetchX()'와 'fetchY()'는 제각기 값을 가진 프라미스를 반환, 지금 또는 나중에 준비됨
add(fetchX(), fetchY())

// 두 숫자의 합이 담긴 프라미스를 받음
// 이제 반환된 프라미스가 귀결될 때까지 대기하기 위해 'then()'을 연쇄 호출
.then(function(sum) {
  console.log(sum);
});
```

두 계층의 프라미스

- fetchX()와 fetchY()를 직접 호출하여 이들의 반환 값(프라미스)을 add()에 전함. 두 프라미스 속의 원래 값은 지금 또는 나중에 준비되지만 시점에 상관없이 각 프라미스가 같은 결과를 내게끔 정규화함. 덕분에 미래값 X, Y는 시간 독립적으로 추론 가능
- 두 번째 계층은 add()가 (Promise.all([])을 거쳐) 만들어 반환한 프라미스로 then()을 호출하고 대기. add()가 끝나면 덧셈을 마친 미래값이 준비되어 콘솔에 출력, X와 Y의 미래값을 기다리는 로직은 add() 안에 숨어있음

프라미스는 이룸(fulfillment)이 아닌 버림(rejection)으로 귀결될 수 있음  
항상 귀결 값을 프로그램이 결정짓는 이룸 프라미스와는 다르게 버림값은 프로그램 로직에 따라 직접 세팅되거나 런타임 예외에 의해 암시적으로 생겨나기도 함  
프라미스 then() 함수는 이룸 함수를 첫 번째 인자로, 버림 함수를 두 번째 인자로 각각 넘겨받음

```javascript
add(fetchX(), fetchY()).then(
  // 이룸 함수
  function (sum) {
    console.log(sum);
  },
  // 버림 함수
  function (err) {
    console.error(err);
  }
);
```

X, Y 조회시 문제 또는 덧셈 연산 실패 시 add()가 반환하는 프라미스는 버려지고 then()의 두 번째 에러 처리 콜백이 이 프라미스에서 버림값을 받음

프라미스는 시간 의존적인 상태를 외부로부터 캡슐화(원래 값을 이룰지 버릴지 기다림)하기 때문에 프라미스 자체는 시간 독립적  
타이밍 또는 내부 결과값에 상관없이 예측 가능한 방향으로 구성할 수 있음

프라미스는 일단 귀결된 후에는 상태가 그대로 유지되며(귀결 시점에 불변값이 됨) 필요할 때마다 꺼내 쓸 수 있음

### 3.1.2 완료 이벤트

프라미스 각각은 미래값으로서 작동하지만 프라미스의 귀결은 비동기 작업의 여러 단계를 '흐름 제어'하기 위한 체계

예: 어떤 작업을 위한 foo() 함수 호출  
구체적인 작업 내용은 모르고 시간이 걸릴 수 도 있음  
단지 foo()가 언제 끝나 다음 단계로 넘어갈 수 있을지 알면 그만. 다시 말해, 다음 단계로 진행할 수 있게끔 foo()의 완료 상태를 알림 받을 방법이 필요한 상태

전통적 자바스크립트 사고 방식 - 알림 자체를 하나의 이벤트로 보고 리스닝함  
foo()의 완료 이벤트(또는 진행 이벤트)를 리스닝 함으로써 알림 요건을 재구성  
콜백에서의 알림은 작업부(foo())에서 넘겨준 콜백을 호출하면 성립됨  
하지만 프라미스에서는 이 관계가 역전되어 foo()에서 이벤트를 리스닝하고 있다가 알림을 받게 되면 다음으로 진행

```javascript
foo(x) {
  // 시간이 걸리는 작업
}
foo(42)
on(foo "완료") {
  // 다음 단계로 갈 수 있음
}
on(foo "에러") {
  // foo에서 뭔가 잘못됨
}
```

foo() 호출 뒤 2개의 이벤트 리스너를 설정  
foo()를 호출하여 나올 수 있는 결과는 완료 아니면 에러 뿐  
foo()는 호출부에서 이벤트를 받아 어떻게 처리할지 알 수 없으므로 관심사가 분리됨  
자바스크립트로 표현

```javascript
function foo(x) {
  // 시간이 걸리는 작업
  // 이벤트 구독기를 생성하여 반환
  return listener;
}
var evt = foo(42);
evt.on("completion", function () {
  // 다음 단계로 갈 수 있음
});
evt.on("failure", function (err) {
  // foo에서 뭔가 잘못됨
});
```

foo()는 이벤트 구독기를 생성하여 반환하도록 명시되어 있고 호출부 코드는 두 이벤트 처리기를 각각 등록함  
일반적인 콜백 지향 코드와 정반대  
foo()에 콜백 함수를 넘겨주는 대신 foo()가 evt라는 이벤트 구독기를 반환하고 여기에 콜백 함수를 넣음

콜백은 그 자신이 제어의 역전 - 콜백 패턴을 뒤집는 것은 역전을 역전, 곧 제어의 되역전이고 제어권을 호출부에 되돌려놓는 것  
여러 파트로 나뉘어진 코드가 이벤트를 리스닝하면서 foo() 완료 시 독립적으로 알림을 받아 이후 단계를 진행

```javascript
var evt = foo(42);
// 'bar()'는 'foo()'의 완료 이벤트를 리스닝
bar(evt);
// 'baz()'도 'foo()의 완료 이벤트를 리스닝
baz(evt);
```

제어의 비역전에 의해 관심사를 분리하여 bar(), baz()는 foo() 호출에 끼어들 이유가 없어짐  
foo() 역시 bar(), baz() 존재 여부와 상관 없이 또는 자신의 작업 완료를 다른 작업이 기다린다는 사실을 알 필요가 없음  
evt 객체는 분리된 관심사 간의 중립적인 중재자 역할을 수행

#### 프라미스 '이벤트'

evt 이벤트 구독기는 프라미스와 유사  
foo()는 프라미스 인스턴스를 생성하여 반환하고 이 프라미스를 bar()와 baz()에 전달

```javascript
function foo(x) {
  // 시간이 걸리는 작업
  // 프라미스를 생성하여 반환
  return new Promise(function (resolve, reject) {
    // 결과적으로 'resolve()', 'reject()' 중 한 쪽을 호출, 이들은 프라미스의 귀결 콜백 함수 역할을 함
  });
}
var p = foo(42);
bar(p);
baz(p);
```

전달된 function은 즉시 실행되고 resolve, reject 인자 2개를 받음  
이 두 인자가 프로미스의 귀결 함수  
resolve()는 이룸, reject()는 버림을 나타냄

bar(), baz() 내부

```javascript
function bar(fooPromise) {
  // 'foo()'의 완료 여부 리스닝
  fooPromise.then(
    function () {
      // 'foo()'는 이제 'bar() 작업을 함
    },
    function () {
      // 'foo()'에서 뭔가 잘못됨
    }
  );
}
// baz도 동일
```

프라미스 귀결 시 어떤 메시지를 보내야 하는 것은 아니며 단지 흐름 제어 신호로 쓰일 수도 있음  
다른 방법

```javascript
function bar() {
  // 'foo()'는 확실히 종료, 'bar()' 작업 시작
}
function oopsBar() {
  // 'foo()'에서 뭔가 잘못되어 'bar()'는 실행되지 않음
}
// 'baz()'와 'oopsBaz()'도 동일

var p = foo(42);
p.then(bar, oopsBar);
p.then(baz, oopsBaz);
```

프라미스 p를 bar(), baz()에 태워보내는 대신 bar(), baz() 두 함수 실행 이후를 제어하기 위해 프라미스를 이용  
이전 예제와의 차이는 에러 처리 방식  
전자는 foo()의 이룸/버림 여부와 관계없이 무조건 bar()를 호출, foo() 실행이 실패할 경우 자체 로직으로 처리. baz()도 마찬가지  
후자는 foo() 성공 시에만 bar()를 호출하고 그 외엔 oopsBar() 함수를 호출. baz()도 동일  
두 예제 모두 같은 프라미스 p에 대해 then()을 두 번 호출하는 부분 - 프라미스는 (일단 귀결되면) 똑같은 결과를 영원히 유지하므로 이후에 필요시 계속 꺼내 쓸 수 있음  
('지금'이든 '나중'이든) p가 귀결되고 나면 다음 단계는 항상 동일

## 3.2 데너블 덕 타이핑

프라미스 값의 확인 - 어떤 값이 프라미스인지 아닌지(그 값이 프라미스처럼 작동하는지)  
new Promise() 구문으로 생성된 프라미스는 p instanceof Promise로 확인. 그러나 불충분한 방법  
프라미스 값은 주로 다른 브라우저 창(iframe 등)에서 넘겨받는데, 현재 윈도우/프레임에 있는 프라미스와는 동떨어진 프라미스임 - 프라미스 인스턴스 체크만으로는 제대로 확인 불가  
외부 라이브러리/프레임워크 중에는 ES6 Promise가 아닌 고유한 방법으로 구현한 프라미스를 사용할 가능성도 존재  
구식 브라우저에서 라이브러리 형태로 프라미스를 사용하는 경우도 있을 수 있음

진짜 프라미스는 then() 메서드를 가진, '데너블'이라는 객체 또는 함수를 정의하여 판별하는 것으로 규정됨  
데너블에 해당하는 값은 무조건 프라미스 규격에 맞다고 간주

덕 타이핑 - 어떤 값의 타입을 그 형태를 보고 집작하는 타입 체크  
덕 타이핑 방식의 데너블 체크

```javascript
if (
  p !== null &&
  (typeof p === "object" || typeof p === "function") &&
  typeof p.then === "function"
) {
  // 데너블로 간주
} else {
  // 데너블이 아님
}
```

프라미스를 then()이라는 이름의 함수가 정의된 임의의 객체/함수로 이루고 싶지만 이 객체/함수를 프라미스/데너블로 다루고 싶지 않은 경우  
불가능. 엔진이 데너블이라고 자동 인식하여 특별한 규칙을 적용함

then()이라는 함수의 존재를 미처 몰랐다고 해도 상황은 동일

```javascript
var o = { then: function(){} };

// 'v'를 'o'의 '[[Prototype]]'에 연결
var v = Object.create(o);

v.someStuff = "cool";
v.otherStuff = "not so cool;
v.hasOwnProperty("then"); //false
```

개발자의 의도가 v를 평범한 객체로 생성하고자 했다 해도 then() 메서드가 정의된 별개의 객체 o와 Prototype, 데너블 덕 타이핑 감정 결과 v는 데너블로 판정됨

```javascript
Object.prototype.then = function () {};
Array.prototype.then = function () {};

var v1 = { hello: "world" };
var v2 = ["Hello", "World"];
```

v1, v2 모두 데너블로 인식됨  
다른 개발자가 실수 또는 악의적으로 then()을 Object.prototpye. Array.prototype 또는 다른 네이티브 프로토타입에 추가해도 막을 방법이 없음  
심지어 then() 자리에 콜백 인자를 하나도 호출하지 않는 함수가 세팅되면 그러한 값으로 귀결된 프라미스는 무한 루프에 빠지게 됨

## 3.3 프라미스 믿음

콜백만 사용한 코드의 믿음성 문제

- 너무 일찍 콜백을 호출
- 너무 늦게 콜백을 호출(또는 전혀 호출하지 않음)
- 너무 적게, 또는 너무 많이 콜백을 호출
- 필요한 환경/인자를 정상적으로 콜백에 전달하지 못함
- 발생 가능한 에러/예외를 무시함

프라미스 특성은 이와 같은 모든 일에 대해 유용하고 되풀이하여 쓸 수 있는 해결책을 제시하게끔 설계됨

### 3.3.1 너무 빨리 호출

같은 작업인데도 어떨 때는 동기적으로, 어떨 때는 비동기적으로 끝나 결국 경합 조건에 이르게 되는 자르고 현상(Zalgo-Like Effects)을 일으킬 코드인지 확인하는 문제  
프라미스는 new Promise(function(resolve) { resolve(42); })처럼 바로 이루어져도 프라미스의 정의상 동기적으로 볼 수 없으므로 이 문제는 영향받을 일이 없음  
따라서 then() 호출시 프라미스가 이미 귀결된 이후라 해도 then()에 건넨 콜백은 항상 비동기적으로만 부름  
프라미스는 자르고를 알아서 예방하므로 setTimeout(..., 0)과 같은 방식을 쓸 필요가 없음

### 3.3.2 너무 늦게 호출

프라미스 then()에 등록한 콜백은 새 프라미스가 생성되면서 resolve(), reject() 중 어느 한쪽은 자동 호출되도록 스케줄림됨. 이렇게 스케줄링된 콜백은 다음 비동기 시점에 예상대로 실행  
프라미스가 귀결되면 then()에 등록된 콜백들이 그 다음 비동기 기회가 찾아왔을 때 순서대로 실행되며 어느 한 콜백 내부에서 다른 콜백의 호출에 영향을 주거나 지연시킬 일은 없음

```javascript
p.then(function () {
  p.then(function () {
    console.log("C");
  });
  console.log("A");
});
p.then(function () {
  console.log("B");
});
// A B C
```

프라미스 작동 원리 덕분에 "C"가 끼어들어 "B"를 앞지를 가능성은 없음

### 프라미스 스케줄링의 기벽

별개의 두 프라미스에서 연쇄된 콜백 사이의 상대적인 실행 순서는 장담할 수 없음  
두 프라미스 p1, p2가 모두 귀결된 상태라면 p1.then(); p2.then();에서 p1 콜백이 p2 콜백보다 먼저 실행되어야 할 것 같지만 꼭 그렇지 않은 경우가 존재

```javascript
var p3 = new Promise(function (resolve, reject) {
  resolve("B");
});

var p1 = new Promise(function (resolve, reject) {
  resolve(p3);
});

p2 = new Promise(function (resolve, reject) {
  resolve("A");
});

p1.then(function (v) {
  console.log(v);
});
p2.then(function (v) {
  console.log(v);
});

// A B
```

p1은 즉시값으로 귀결되지 않고 다른 프라미스 p3로 귀결, p3는 다시 "B" 값으로 귀결됨  
p3은 p1로, 비동기적으로 풀리므로 p1 콜백은 p2 콜백보다 비동기 잡 큐에서 후순위로 밀리게 됨

이런 문제를 피하기 위해, 여러 프라미스에 걸친 콜백의 순서/스케줄링에 의존해서는 안됨  
다중 콜백의 순서가 문제를 일으키지 않는 방향으로 코딩하는 것이 바람직, 가급적 피하는 것이 좋음

### 3.3.3 한번도 콜백을 안 호출

프라미스 스스로 (귀결된 이후에) 귀결 사실을 알리지 못하게 막을 방도는 없음  
이룸/버림 콜백이 프라미스에 모두 등록된 상태라면 프라미스 귀결 시 둘 중 하나는 반드시 호출  
콜백 자체에 자바스크립트 에러가 발생하더라도 콜백은 호출됨  
프라미스 스스로 어느 쪽으로도 귀결되지 않는 상황이라도 경합이라는 상위 수준의 추상화를 이용하여 프라미스로 해결 가능

```javascript
// 프라미스를 타임아웃시키는 유틸리티
function timeoutPromise(delay) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      reject("타임아웃");
    }, delay);
  });
}

// 'foo()'에 타임아웃을 건다
Promise.race([
  foo(), // foo() 실행
  timeoutPromise(3000), //3초
]).then(
  function () {
    // foo()가 제시간에 완료
  },
  function (err) {
    // foo()가 버려졌거나 제시간에 완료 실패
    // err를 조사하여 원인을 파악
  }
);
```

프로그램 행(hang)이 안 걸리게 반드시 foo()의 결과를 알려줌

### 3.3.4 너무 가끔, 너무 종종 호출

콜백의 호출 횟수는 한 번 - '너무 가끔'은 0번 부른다는 뜻 -> 앞의 경우와 동일  
'너무 종종' - 프라미스는 정의상 한번만 귀결됨. 어떤 이유로 프라미스 생성 코드가 resolve(), reject() 중 하나 또는 모두를 여러 차례 호출하려고 하면 프라미스는 오직 최초의 귀결만 취하고 이후의 시도는 무시함  
프라미스는 한 번만 귀결되기 때문에 then()에 등록한 콜백 도한 한 번씩만 호출됨

### 3.3.5 인자/환경 전달 실패

명시적인 값으로 귀결되지 않으면 그 값은 undefined로 세팅됨  
값과 상관없이, 지금이든 나중이든 프라미스는 모든 등록한 콜백으로 반드시 전해짐  
resolve(), reject() 함수를 부를 때 인자를 여러 개 넘겨도 두 번째 이후 인자는 무시됨  
값을 여러 개 넘기고자 할 경우 배열이나 객체를 사용

### 3.3.6 에러/예외 삼키기

어떤 이유(에러 메시지)로 프라미스를 버리면 그 값은 버림 콜백(들)으로 전달됨  
프라미스가 생성 중 또는 귀결을 기다리는 도중 언제라도 TypeError, ReferenceError 등의 자바스크립트 에러 발생시 예외를 잡아 주어진 프라미스를 강제로 버림

```javascript
var p = new Promise(function (resolve, reject) {
  foo.bar(); // foo는 정의된 바 없음 - 에러 발생
  resolve(42); // 실행되지 않음
});
p.then(
  function fulfilled() {
    // 실행되지 않음
  },
  function rejected(err) {
    // foo.bar()줄에서 에러 발생 - err는 TypeError 예외 객체
  }
);
```

프라미스는 자바스크립트 예외조차도 비동기적 작동으로 바꾸어 경합 조건을 줄임

프라미스는 이루어졌으나 이를 감지하는 코드(then()에 등록한 콜백)에서 자바스크립트 예외가 발생하는 경우

```javascript
var p = new Promise(function (resolve, reject) {
  resolve(42);
});
p.then(
  function fulfilled(msg) {
    foo.bar();
    console.log(msg); // 실행되지 않음
  },
  function rejected(err) {
    // 실행되지 않음
  }
);
```

에러가 감지되지 않음 - p.then()이 반환한 또 다른 프라미스에서 TypeError 예외가 나면서 버려짐  
p는 이미 값이 귀결된 상태 - p의 귀결 상태를 감지하는 코드에서 에러가 나도 그 상태를 버림으로 바꿀 수는 없음

### 3.3.7 미더운 프라미스?

프라미스는 콜백을 완전히 없애기 위한 장치가 아니라, 콜백을 넘겨주는 위치를 달리해주는 장치  
foo()에 콜백을 바로 넘기지 않고 foo()에서 '뭔가'를 반환받아 그것을 콜백에 전달

반환받은 '뭔가'가 미더운 프라미스라고 장담할 수 있는가  
의문에 대한 해결책이 이미 프라미스에 구현되어 있음  
ES6 프라미스 구현체에 추가된 Promise.resolve() 함수

즉시값 또는 프라미스 아닌/데너블 아닌 값을 Promise.resolve()에 건네면 이 값으로 이루어진 프라미스를 획득, 따라서 다음의 p1과 p2는 동일

```javascript
var p1 = new Promise(function (resolve, reject) {
  resolve(42);
});
var p2 = Promise.resolve(42);
```

Promise.resolve()에 진짜 프라미스가 넘어가도 결과는 마찬가지

```javascript
var p1 = Promise.resolve(42);
var p2 = Promise.resolve(p1);
p1 === p2; //true
```

프라미스가 아닌 데너블 값을 Promise.resolve()에 전달하면 일단 그 값을 풀어보고 최종적으로 프라미스 아닌 것 같은 구체적인 값이 나올 때까지 계속 풀어봄

```javascript
var p = {
  then: function (cb) {
    cb(42);
  },
};

p.then(
  function fulfilled(val) {
    console.log(val); //42
  },
  function rejected(err) {
    // 실행되지 않음
  }
);
```

p는 데너블이지만 진짜 프라미스는 아님 - 제대로 작동

```javascript
var p = {
  then: function (cb, errcb) {
    cb(42);
    errcb("사악한 미소");
  },
};

p.then(
  function fulfilled(val) {
    console.log(val); //42
  },
  function rejected(err) {
    console.log(err); //사악한 미소
  }
);
```

p는 데너블이지만 프라미스처럼 작동하지 않음 - 미덥지 않다는 결론  
그러나 어떤 p라도 일단 Promise.resolve()에 넣으면 정규화하므로 안전한 결과를 기대할 수 있음

```javascript
Promise.resolve(p).then(
  function fulfilled(val) {
    console.log(val); //42
  },
  function rejected(err) {
    // 실행되지 않음
  }
);
```

Promise.resolve()는 데너블을 인자로 받아 데너블 아닌 값이 발견될 때까지 풀어봐서 믿을 만한 프라미스를 즉석에서 내놓음  
진짜 프라미스 값을 넘기면 도로 내놓기 때문에 믿음성 확보를 위해 Promise.resolve()를 거친다고 해서 단점이 될 만한 요소는 없음

```javascript
// 비권장
foo(42).then(function (v) {
  console.log(v);
});
//권장
Promise.resolve(foo(42)).then(function (v) {
  console.log(v);
});
```
### 3.3.8 믿음 형성

프라미스는 콜백에 '믿음'의 의미를 증강시킨 패턴. 좀 더 타당하고 미더운 방식으로 작동  
콜백의 '제어의 역전'을 다시 역전하여 비동기 코드에 대한 믿을만한 체계에 제어권을 다시 반환한 셈  