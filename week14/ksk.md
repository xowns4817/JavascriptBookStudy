## 3.5 에러 처리

try...catch 구문 - 동기적인 프로그래밍에서 가장 일반적인 에러 처리 형태  
비동기 코드 패턴에서는 무용지물

```javascript
function foo() {
  setTimeout(function () {
    baz.bar();
  }, 100);
}
try {
  foo();
  // 나중에 'baz.bar()'에서 전역 에러 발생
} catch (err) {
  // 실행되지 않음
}
```

사용은 용이하나 비동기 작업에서는 작동하지 않음 - 실행 환경의 추가 지원이 필요

콜백 세계에서는 에러 처리 패턴에 관한 몇 가지 표준이 존재  
에러-우선 콜백 스타일

```javascript
function foo(cb) {
  setTimeout(function () {
    try {
      var x = baz.bar();
      cb(null, x); // 이룸
    } catch (err) {
      cb(err);
    }
  }, 100);
}
foo(function (err, val) {
  if (err) {
    console.error(err);
  } else {
    console.log(val);
  }
});
```

콜백의 첫 번째 인자 err를 통해 에러 신호를 감지

이런 방식은 비동기적 에러 처리 구현은 가능하나 여러 개를 조합하면 문제가 발생  
수준이 제각각인 에러 우선 콜백이 서로 뒤엉키다보면 결국 콜백 지옥 형성

프라미스 - 분산-콜백 스타일로 이룸/버림 각각의 콜백을 지정하여 에러를 처리

```javascript
var p = Promise.reject("허걱");
p.then(
  function fulfilled() {
    // 실행되지 않음
  },
  function rejected(err) {
    console.log(err); // 허걱
  }
);
```

프라미스 에러처리의 미묘한 부분이 존재

```javascript
var p = Promise.resolve(42);
p.then(
  function fulfilled(msg) {
    // 숫자에는 문자열 함수가 없으므로 에러 발생
    console.log(msg.toLowerCase());
  },
  function rejected(err) {
    // 실행되지 않음
  }
);
```

p는 이미 42 값으로 이루어진 상태기 때문에 에러 처리기가 문법 오류를 감지하지 못함  
p는 불변값 - 에러 알림은 오직 p.then()이 반환한 프라미스만이 가능한데 위 예제에서는 이 프라미스를 포착할 방법이 없음 - 에러가 묻히기 쉬운 구조

### 3.5.1 절망의 구덩이

catch()의 사용 - 프라미스의 에러 무시 상황을 방지하기 위함

```javascript
var p = Promise.resolve(42);
p.then(function fulfilled(msg) {
  // 숫자에는 문자열 함수가 없으므로 에러 발생
  console.log(msg.toLowerCase());
}).catch(handleErrors);
```

p로 유입된 에러 및 p 이후 귀결 중 발생한 에러 모두 handleErrors()로 유입

만약 handleErrors()에서 에러가 발생하는 경우  
catch()가 반환한 프라미스도 존재  
-> 프라미스 연쇄의 마지막 단계에 방치된 프라미스에서 에러가 나면 잡히지 않고 그대로 있을 가능성은 항상 존재

### 3.5.2 잡히지 않은 에러 처리

다른 접근 방법 - 프라미스 연쇄 끝에 done() 추가  
done() 버림 처리기 내부에서 에러가 나면 잡히지 않은 전역 에러로 던짐

```javascript
var p = Promise.resolve(42);
p.then(function fulfilled(msg) {
  // 숫자에는 문자열 함수가 없으므로 에러 발생
  console.log(msg.toLowerCase());
}).done(null, handleErrors);

// handleErrors()에서 예외가 발생하면 여기서 전역으로 던짐
```

ES6 표준에 들어있지 않기 때문에 믿을 만한 보편적인 해결 방안이라고 할 수 없음

브라우저의 고유 기능 - 언제 어떤 객체가 가비지 콜렉션될지 파악하고 추적 가능  
브라우저는 프라미스 객체를 추적하면서 언제 가비지를 수거하면 될지 알고 있으며, 프라미스가 버려지면 잡히지 않는 에러이므로 개발자 콘솔창에 표시해야 할지 여부를 결정할 수 있음

그러나 프라미스가 제대로 가비지 콜렉션되지 않으면 브라우저의 가비지 콜렉션 기능이 버림 프라미스를 파악/진단하는 데 도움이 되지 않음

### 3.5.3 성공의 구덩이

- 기본적으로 프라미스는 그 다음 잡/이벤트 루프 틱 시점에 에러 처리기가 등록되어 있지 않을 경우 모든 버림을 (콘솔창에) 알리도록 되어 있음
- 감지되기 전까지 버림 프라미스의 버림 상태를 계속해서 유지하려면 defer()를 호출해서 해당 프라미스에 관한 자동 에러 알림 기능을 꺼야 함

프라미스가 버려지면 엔진은 기본적으로 개발자 콘솔창에 이 사실을 알림  
개발자는 암시적으로 버림 전에 에러 처리기를 등록하거나, 명시적으로 defer()를 호출하여 알람 기능을 끌 수 있음  
어느 쪽이든 긍정 오류를 제어하는 일은 개발자의 몫

```javascript
var p = Promise.reject("허걱").defer();

// foo()는 프라미스-인식형 함수
foo(42).then(
  function fulfilled() {
    return p;
  },
  function rejected(err) {
    // foo() 에러 처리
  }
);
```

p 생성시 버림 상태를 사용/감지하려면 잠시 대기해야 하므로 defer()를 호출 -> 전역 범위로 알림이 발생하지 않음  
defer()는 계속 연쇄할 목적으로 같은 프라미스를 단순 반환함  
foo()가 반환한 프라미스에는 곧바로 에러 처리기가 달리므로 알림 기능은 암시적으로 배제되고 전역 알림도 일어나지 않음

반면 then()이 반환한 프라미스에는 defer()나 에러 처리기 등이 달려있지 않아 프라미스가 버림되면 잡히지 않은 에러 형태로 개발자 콘솔창에 나타남

이러한 설계를 '성공의 구덩이'라고 함 - 모든 에러는 기본적으로 처리 또는 통지됨  
이 접근 방식이 유일하게 위험한 경우는, 프라미스를 defer() 했으나 실제로 버림을 감지/처리하지 못했을 때

## 3.6 프라미스 패턴

프라미스에 기반을 둔 더 추상화한 형태로 구축 가능한 비동기 패턴의 변형

### 3.6.1 Promise.all([])

비동기 시퀀스(프라미스 연쇄)는 주어진 시점에 단 한개의 비동기 작업만 가능  
2개 이상의 단계가 동시(병렬) 작동해야 하는 경우  
관문 - 복수의 병렬/동시 작업이 끝날 때까지 진행하지 않고 대기하는 고전적 장치. 어느 쪽이 먼저 끝나든 모든 작업이 다 끝나야 게이트가 열리고 다음으로 넘어감  
프라미스 API에서는 이러한 패튼을 all([])로 구현

ajax 2개를 동시에 요청한 뒤 순서에 상관없이 모두 완료될 때까지 기다리고 3번째 ajax 요청을 하는 코드

```javascript
// request() - 프라미스-인식형 ajax 유틸리티

var p1 = request("http://some.url.1/");
var p2 = request("http://some.url.2/");

Promise.all([p1, p2])
  .then(function (msgs) {
    // p1, p2 둘 다 이루어져 이곳에 메시지가 전달됨
    return request("http://some.url.3/?v=" + msgs.join(","));
  })
  .then(function (msg) {
    console.log(msg);
  });
```

Promise.all([]) - 보통 프라미스 인스턴스들이 담긴 배열 하나를 인자로 받고 호출 결과 반환된 프라미스는 이룸 메시지(msg) 수신. 이 메시지는 (이룸 순서에 상관 없이) 배열에 나열한 순서대로 프라미스들을 통과하면서 얻어진 이룸 메시지의 배열

Promise.all([])이 반환한 메인 프라미스는 자신의 하위 프라미스들이 모두 이루어져이 이루어질 수 있음  
하나의 프라미스라도 버려지면 Promise.all([]) 프라미스 역시 버려지며 다른 프라미스 결과도 무효화

### 3.6.2 Promise.race([])

Promise.all([])은 여러 프라미스를 동시에 편성하여 모두 이루어진다는 전제로 작동  
결승선을 통과한 최초의 프라미스만 인정하고 나머지는 무시해야 할 때도 있음 -> 걸쇠 패턴(경합)이 필요

Promise.race([]) - 하나 이상의 프라미스, 데너블, 즉시값이 포함된 배열 인자 1개를 받음  
하나라도 이루어진 프라미스가 있을 경우에 이루어지고 하나라도 버려지는 프라미스가 있으면 버려짐

```javascript
// request() - 프라미스-인식형 ajax 유틸리티

var p1 = request("http://some.url.1/");
var p2 = request("http://some.url.2/");

Promise.race([p1, p2])
  .then(function (msg) {
    // p1, p2 중 하나는 경합의 승자
    return request("http://some.url.3/?v=" + msg);
  })
  .then(function (msg) {
    console.log(msg);
  });
```

프라미스 하나만 승자가 되기 때문에 이룸값은 배열이 아닌 단일 메시지

#### 타임아웃 경합

Promise.race([])를 이용한 프라미스 타임아웃 패턴 구현

```javascript
// foo(): 프라미스-인식형 함수

// 앞서 정의한 timeoutPromise()는 일정 시간 지연 후 버려진 프라미스를 반환

// foo()에 타임아웃 걸기
Promise.race([foo(), timeoutPromise(3000)]).then(
  function () {
    // foo()는 제때 이루어짐
  },
  function (err) {
    // foo()가 버려졌거나 제때 마치지 못함 -> err를 조사하여 원인 파악
  }
);
```

#### 결론

성능 관점이 아닌 작동 관점에서 폐기/무시된 프라미스의 결말  
프라미스는 취소가 안 되고 외부적 불변성에 관한 믿음을 무너뜨리면 안되기 때문에 그냥 조용히 묻힘

일부 개발자들은 finally() 등의 콜백을 등록하여 프라미스 귀결 시 항상 호출하는 형태로 필요시 뒷정리를 할 수 있는 형태를 제안

```javascript
var p = Promise.resolve(42);
p.then(something).finally(cleanup).then(another).finally(cleanup);
```

다음과 같은 정적 헬퍼 유틸리티를 만들어 귀결을 (간섭 없이) 알아챌 수 있음

```javascript
// 폴리필 안전 체크
if (!Promise.observe) {
  Promise.observe = function (pr, cb) {
    // pr의 귀결을 부수적으로 감지
    pr.then(
      function fulfilled(msg) {
        // 비동기 콜백(잡)을 스케줄링
        Promise.resolve(msg).then(cb);
      },
      function rejected(err) {
        // 비동기 콜백(잡)을 스케줄링
        Promise.resolve(err).then(cb);
      }
    );
    // 원래 프라미스 반환
    return pr;
  };
}
```

타임아웃 예제에 적용

```javascript
Promise.race([
  Promise.observe(
    foo(),
    function cleanup(msg) {
      // 제 시간에 끝나지 않아도 foo() 이후 뒷정리 수행
    }
  ),
  timeoutPromise(3000);
])
```
Promise.observe() - 다수 프라미스들이 서로 간섭하지 않고도 완료 여부를 감지할 수 있게 해주는 유틸리티 예

### 3.6.3 all([]) / race([])의 변형
ES6 프라미스 내장된 Promise.all, Promise.race을 변형한 패턴 중 자주 쓰이는 것들  
- none(): all()과 비슷하지만 이룸/버림이 정반대. 모든 프라미스는 버려져야 하며, 버림이 이룸값이 되고 이룸이 버림값이 됨
- any(): all()과 유사하나 버림은 모두 무시, (전부가 아닌) 하나만 이루어지면 됨
- first(): any()의 경합과 유사. 일단 최초로 프라미스가 이루어지고 난 이후엔 다른 이룸/버림은 무시
- last(): first()와 거의 같으나 최후의 이룸 프라미스 하나만 승자가 됨  

직접 정의한 예시: first()
```javascript
if(!Promise.first) {
  Promise.first = function(prs) {
    return new Promise(function(resolve, reject) {
      // 전체 프라미스를 순회
      prs.forEach(function(pr) {
        // 값 정규화
        Promise.resolve(pr)
        // 어떤 프라미스가 가장 처음 이기더라도 메인 프라미스를 귀결함
        .then(resolve);
      });
    });
  };
}
```

### 3.6.4 동시 순회
프라미스 리스트를 순회하면서 각각에 대해 어떤 처리를 해야할 경우  
프라미스별 처리 작업이 근본적으로 동기적이라면 forEach()와 같은 함수로도 충분  
그러나 처리 작업이 비동기적이거나 동시 실행될 수 있다면 비동기 버전 유틸리티 사용  
예)map() - 각 작업별로 추출된 비동기 이룸값이 담겨진 배열을 이룸값으로 하는 프라미스를 반환
```javascript
if(!Promise.map) {
  Promise.map = function(vals, cb) {
    // 모든 매핑된 프라미스를 기다리는 새 프라미스
    return Promise.all(
      // 참고: map()은 값의 배열을 프라미스 배열로 반환
      vals.map(function(val) {
        // val이 비동기적으로 매핑된 이후 귀결된 새 프라미스로 val을 대체
        return new Promise(function(resolve) {
          cb(val, resolve);
        });
      })
    );
  };
}
```
map()을 (단순값 대신) 프라미스 리스트에 사용한 코드
```javascript
var p1 = Promise.resolve(21);
var p2 = Promise.resolve(42);
var p3 = Promise.resolve("허걱");

// 리스트에 있는 값이 프라미스에 있더라도 2를 곱함
Promise.map([p1, p2, p3], function(pr, done) {
  // 원소 자체를 확실히 프라미스로 생성
  Promise.resolve(pr)
  .then(
    // v로 값을 추출
    function(v) {
      // 이루어진 v를 새 값으로 매핑
      done(v * 2);
    },
    // 프라미스 버림 메시지로 매핑
    done
  );
})
.then(function(vals) {
  console.log(vals); // [42, 84, "허걱"]
});
```