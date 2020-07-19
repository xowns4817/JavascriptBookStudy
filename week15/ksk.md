## 3.7 프라미스 API 복습

### 3.7.1 new Promise() 생성자

Promise() 생성자 - 항상 new와 함께 사용하며 동기적으로/즉시 호출할 콜백 함수를 전달  
다시 프라미스를 귀결 처리할 콜백 2개 전달 - resolve()와 reject()라고 명명하는 것이 보통

```javascript
var p = new Promise(function (resolve, reject) {
  // resolve() - 프라미스 귀결/이룸
  // reject() - 프라미스 버림
});
```

reject()는 그냥 프라미스를 버림

resolve()는 넘어온 값을 보고 이룸/버림 중 한 가지로 처리  
즉시값, 프라미스 아닌/데너블 아닌 값이 resolve()에 흘러오면 이 프라미스는 해당 값으로 이루어짐  
resolve()에 진짜 프라미스/데너블 값이 전달되면 재귀적으로 풀어보고 그 최종 값이 프라미스의 마지만 귀결/상태가 됨

### 3.7.2 Promise.resolve()와 Promise.reject()

Promise.resolve()는 이미 버려진 프라미스를 생성함  
두 프라미스는 본질적으로 동등

```javascript
var p1 = new Promise(function (resolve, reject) {
  reject("허걱");
});
var p2 = Promise.reject("허걱");
```

Promise.resolve()는 이미 이루어진 프라미스를 생성하는 용도로 사용  
데너블 값을 재귀적으로 풀어보고 그 최종 귀결값이 반환된 프라미스에 해당

```javascript
var fulfilledTh = {
  then: function (cb) {
    cb(42);
  },
};
var rejectedTh = {
  then: function (cb, errCb) {
    errCb("Oops");
  },
};

var p1 = Promise.resolve(fulfilledTh);
var p2 = Promise.resolve(rejectedTh);

// p1은 이룸 프라미스
// p2는 버림 프라미스
```

Promise.resolve()에 진짜 프라미스를 넣으면 아무 일도 하지 않음  
따라서 종류를 모르는 값을 Promise.resolve()에 넣었는데 우연히 진짜 프라미스더라도 오버헤드는 전혀 없음

### 3.7.3 then()과 catch()

프라미스가 귀결되면 두 처리기 중 하나만 비동기적으로 호출

then() - 하나 또는 2개의 안자를 받는데 첫 번째는 이룸 콜백, 두 번째는 버림 콜백  
어느 한쪽을 누락하거나 함수가 아닌 값으로 지정하면 각각 기본 콜백으로 대체됨  
기본 이룸 콜백은 그냥 메시지를 전달하기만 하고 기본 버림 콜백은 단순히 전달받은 에러 사유를 도로 던짐

catch() - 버림 콜백 하나만 받고 이룸 콜백은 기본 이룸 콜백으로 대체. then(null, )이나 다름없음

```javascript
p.then(fulfulled);
p.then(fulfulled, rejected);
p.catch(rejected); // 또는 p.then(null, rejected)
```

둘 다 새 프라미스를 반들어 반환하므로 프라미스 연쇄 형태로 흐름 제어를 표현할 수 있음

### 3.7.4 Promise.all([])과 Promise.race([])

Promise.all - 주어진 모든 프라미스들이 이루어져야 메인 프라미스도 이루어지고 단 하나라도 버려지면 메인 반환 프라미스도 폐기됨  
Promise.race - 오직 최초로 귀결된 프라미스만 승자가 되고 그 귀결 값을 반환할 프라미스의 귀결 값으로 삼음. 걸쇠 패턴

```javascript
var p1 = Promise.resolve(42);
var p2 = Promise.resolve("Hello World");
var p3 = Promise.reject("허걱");

Promise.race([p1, p2, p3]).then(function (msg) {
  console.log(msg); //42
});
Promise.all([p1, p2, p3]).catch(function (err) {
  console.error(err); //"허걱"
});
Promise.all([p1, p2]).then(function (msgs) {
  console.log(msgs); // [42, "Hello World"]
});
```

## 3.8 프라미스 한계

### 3.8.1 시퀀스 에러 처리

프라미스 연쇄는 구성원들을 한데 모은 사슬에 불과하기 때문에 전체 연쇄를 하나의 '뭔가'로 가리킬 개체가 마땅치 않음  
일어날지 모를 에러를 밖에서는 감지할 방법이 없음

에러 처리기가 없는 프라미스 연쇄에서 에러 발생시 나중에 어딘가에서 감지될 때까지 연쇄를 따라 하위로 전파  
이런 경우라면 연쇄의 마지막 프라미스를 가리키는 레퍼런스만 갖고 있으면 이곳에 버림 처리기를 등록하여 전파되어 내려온 에러를 처리 가능

```javascript
// foo(), STE2(), STEP3() - 프라미스-인식형 유틸리티

var p = foo(42).then(STE2).then(STEP3);
```

p가 가리키는 대상은 이 연쇄의 첫 번째 프라미스가 아니라 then(STEP3) 호출 후 반환된 마지막 프라미스

프라미스 연쇄는 각 단계에서 자신의 에러를 감지하여 처리할 방법 자체가 없음  
p에 에러 처리기를 달아놓으면 연쇄 어디에서 에러가 나도 이를 받아 처리할 수 있음

```javascript
p.catch(handleErrors);
```

그러나 연쇄의 어느 단계에서 에러 처리를 하면 handleErrors()는 에러를 감지할 방법이 없음  
일반적으로 프라미스 연쇄 시퀀스에서 중간 단계를 참조할 레퍼런스가 없기 때문에 정확하게 에러를 솎아낼 에러 처리기를 추가할 수 없음

### 3.8.2 단일값

프라미스는 정의 상 하나의 이룸값 또는 하나의 버림 사유를 지님 - 코드가 복잡해지면 문제가 될 수 있음

#### 값을 분할

2개 이상의 프라미스로 분해

두 값(x, y)을 비동기적으로 만들어내는 유틸리티 foo()

```javascript
function getY(x) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve((3 * x) - 1);
    }, 100);)
  });
}
function foo(bar, baz) {
  var x = bar * baz;
  return getY(x)
  .then(function(y) {
    // 두 값을 컨테이너에 추가
    return [x, y];
  });
}
foo(10, 20)
.then(function(msgs) {
  var x = msgs[0];
  var y = msgs[1];
  console.log(x, y); // 200 599
});
```

x, y를 하나의 array 값으로 감싸서 프라미스 하나로 전달할 필요가 없도로 foo()가 반환하는 것을 다시 조정  
각 값은 자신의 프라미스로 감쌀 수 있음

```javascript
function foo(bar, baz) {
  var x = bar * baz;

  // 두 프라미스를 반환
  return [Promise.resolve(x), getY(x)];
}
Promise.all(foo(10, 20)).then(function (msgs) {
  var x = msgs[0];
  var y = msgs[1];
  console.log(x, y);
});
```

프라미스 배열을 넘기는 형태가 구문상 큰 개선이라고 보기 어려움  
그러나 후자가 프라미스 설계 사상을 더 잘 반영 - 차후 x, y의 계산을 별도의 함수로 분리해서 리팩토링하기가 더 쉽고 호출부로 하여금 두 프라미스를 알아서 조정하도록 두는 편이 foo() 안에 세부 로직을 추상화하는 것보다 더 깔끔하고 유연함

#### 인자를 풀기/퍼뜨리기

var x = ... 와 var y = ... 할당은 불필요한 오버헤드  
헬퍼 유틸리티에 기능 보완

```javascript
function spread(fn) {
  return Function.apply.bind(fn, null);
}
Promise.all(
  foo(10, 20);
)
.then(
  spread(function(x, y) {
    console.log(x, y); //200, 599
  })
)
```

로직을 안쪽에 추가

```javascript
Promise.all(
  foo(10, 20);
)
.then(Function.apply.bind(
  function(x, y) {
    console.log(x, y); //200 599
  },
  null
));
```

ES6의 해체(destructing) 방식  
배열 형태로 해체 할당하는 예

```javascript
Promise.all(foo(10, 20)).then(function (msgs) {
  var [x, y] = msgs;
  console.log(x, y); // 200 599
});
```

인자 또한 배열 해체 형식으로 사용 가능

```javascript
Promise.all(foo(10, 20)).then(function ([x, y]) {
  console.log(x, y); //200 599
});
```

### 3.8.3 단일 귀결

대부분의 비동기 프로그래밍에서는 값을 한 번만 가져오기 때문에 1회만 귀결되는 프라미스의 특징이 문제되지 않음  
그러나 데이터 이벤트/스트림에 더 가까운, 다른 모델과 어울리는 비동기 케이스들도 존재. 이러한 케이스에서도 프라미스가 잘 작동할지는 확실하지 않음

버튼 클릭 등 실제로 여러 번 발생하는 자극에 대응하여 일련의 비동기 단계를 진행해야 하는 시나리오 - 대체로 잘 작동하지 않음

```javascript
// click()은 'click 이벤트를 DOM 요소에 바인딩함
// request()는 앞서 정의한 프라미스-인식형 ajax 요청

var p = new Promise(function (resulve, reject) {
  click("#mybtn", resolve);
});
p.then(function (evt) {
  var btnID = evt.currentTarget.id;
  return request("http://some.url.1/?id=" + btnID);
}).then(function (text) {
  console.log(text);
});
```

버튼을 딱 한번만 눌러야 한다는 전제하에 실행  
버튼을 한번 더 누르면 프라미스 p는 이미 귀결된 상태이므로 두 번째 resolve()는 묻힘

따라서 각 이벤트가 발사되면 새 프라미스 연쇄 전체를 생성하는 식으로 기존 체계를 뒤엎을 필요가 있음

```javascript
click("#mybtn", function (evt) {
  var btnID = evt.currentTarget.id;

  request("http://some.url.1/?id=" + btnID).then(function (text) {
    console.log(text);
  });
});
```

이벤트 처리기 안쪽에 전체 프라미스 연쇄를 정의하는 코드 삽입 - 설계 관점에서 관심사/능력의 분리라는 기본 원리에 위배됨

### 3.8.4 타성

프라미스 활용의 실질적 걸림돌 - 기존 코드  
기존 코드(콜백식)를 유지하려는 습관

콜백식 코드

```javascript
function foo(x, y, cb) {
  ajax("http://some.url.1/?x=" + x + "&y=" + y, cb);
}
foo(11, 31, function(err, text) {
  if(err) {
    ]console.error(err);
  } else {
    console.log(text);
  }
});
```

콜백식 코드를 프라미스-인식형 코드로 전환하기 위한 헬퍼

```javascript
if (!Promise.wrap) {
  Promise.wrap = function (fn) {
    return function () {
      var args = [].slice.call(arguments);

      return new Promise(function (reaolve, reject) {
        fn.apply(
          null,
          args.cancat(function (err, v) {
            if (err) {
              reject(err);
            } else {
              resolve(v);
            }
          })
        );
      });
    };
  };
}
```

에러 우선 스타일의 콜백을 마지막 인자로 취하는 함수를 받아 프라미스를 생성, 반환하는 새 함수를 반환하고 콜백을 교체하여 프라미스 이룸/버림과 연결함  
사용 예시

```javascript
var request = Promise.wrap(ajax);
request("http://some.url.1/")
.then(...)
...
```

프라미서리(리프팅, 프라미시파잉)  
Promise.wrap()은 프라미스를 직접 만들지 않고 프라미스를 만드는 함수를 생성함

앞의 예제에 적용

```javascript
// ajax()에 대해 프라미서리 생성
var request = Promise.wrap(ajax);

// foo() 리팩토링
// 당장은 다른 부분의 코드와의 호환성을 위해 외부적으로 콜백 기반 체제 유지
// request()의 프라미스는 내부적으로만 사용
function foo(x, y, cb) {
  request("http://some.url.1/?x=" + x + "&y=" + y).then(function fulfulled(
    text
  ) {
    cb(null, text);
  },
  cb);
}
// foo()에 대한 프라미서리 생성
var betterFoo = Promise.wrap(foo);

// 프라미서리 사용
betterFoo(11, 31).then(
  function fulfilled(text) {
    console.log(text);
  },
  function rejected(err) {
    console.error(err);
  }
);
```

foo()의 콜백식 코드를 유지하고 betterFoo() 프라미서리를 쓰지 않으면서 foo() 자체를 프라미서리로 만드는 방법  
```javascript
// request() 프라미서리로 위임되므로 foo()도 프라미스
function foo(x, y) {
  return request("http://some.url.1/?x=" + x + "&y=" + y);
}
foo(11, 31).then(..) ...
```

### 3.8.5 프라미스는 취소 불가
일단 프라미스를 생성하여 이룸/버림 처리기를 등록하면 외부에서 프라미스 진행을 멈출 방법이 없음
```javascript
var p = foo(42);
Promise.race([p, timeoutPromise(3000)]).then(doSomething, handleError);
p.then(function() {
  // 타임아웃이 되어도 여전히 실행됨
});
```
p 입장에서는 타임아웃은 외부 요소  

귀결 콜백
```javascript
var OK = true;
var p = foo(42);
Promise.race([
  p,
  timeoutPromise(3000)
  .catch(function(err) {
    OK = false;
    throw err;
  })
])
.then(doSomething, handleError);
p.then(function() {
  if(OK) {
    // 타임아웃이 없을 때에만 실행됨
  }
});
```
실행은 되나 최선의 코드는 아니므로 이런 방식은 권장되지 않음  
프라미스 취소는 더 상위 프라미스 추상화 수준에서 구현해야 할 기능  

### 3.8.6 프라미스 성능
콜백식 비동기 작업 연쇄에 비해 프라미스가 처리량이 더 많고 속도도 약간 더 느림  
그러나 콜백에 비해 믿음성, 예측성, 조합성의 장점이 존재
