# 5 프로토타입

## 5.1 [[Prototype]]
자바스크립트 객체에는 Prototype이라는 내부 프로퍼티가 존재  
다른 객체를 참조하는 단순 레퍼런스로 사용  
대부분의 객체가 이 프로퍼티에 null 아닌 값이 생성 시점에 할당됨  
```javascript
var myObject = {
  a: 2
};
myObject.a; //2
```
프로퍼티 참조 시(myObject.a) Get 호출  
Get - 객체 자체에 해당 프로퍼티가 존재하는지 찾아보고 존재하면 그 프로퍼티를 사용  
myObject에 a란 프로퍼티가 없으면 Prototype 링크 작동  
Get은 주어진 프로퍼티를 객체에서 찾지 못하면 곧바로 Prototype 링크를 따라가면서 탐색
```javascript
var anotherObject = {
  a: 2
}
//'anothoerObject'에 연결된 객체를 생성
var myObject = Object.create(anotherObject);
myObject.a; //2
```
myObject.a라는 프로퍼티는 없지만 anotherObject에서 대신 찾아 프로퍼티 접근 값의 결과값으로 반환  
일치하는 프로퍼티명이 나올 때까지 아니면 prototype 연쇄가 끝날 때까지 같은 과정이 발생  
연쇄 끝까지 프로퍼티가 발견되지 않으면 Get은 결과값으로 undefined를 반환  

for...in 루프에서 객체 순환 시에도 prototype 연쇄 검색 과정과 비슷한 방식으로 연쇄에 대한 프로퍼티를 모두 열거함  
in 연산자를 통한 객체 내 프로퍼티 유모 확인 시 객체의 연쇄를 모두 탐색함
```javascript
var anotherObject = {
  a: 2
};
//'anothoerObject'에 연결된 객체를 생성
var myObject = Object.create(anotherObject);

for (var k in myObject) {
  console.log(k + " 발견");
}
//a 발견

("a" in myObject); //true
```
어떤 방식이든 객체에서 프로퍼티 검색 시 prototype 연쇄를 한 번에 한 링크씩 계속 탐색함

### 5.1.1 Object.prototype
일반 prototype 연쇄는 내장 프로토타입 Object.prototype에서 종료  
모든 자바스크립트 객체는 Object.prototype 객체의 자손 - Object.prototype에는 자바스크립트에서 두루 쓰이는 다수의 공용 유틸리티(.toString(), .valueOf() 등)가 포함됨

### 5.1.2 프로퍼티 세팅과 가려짐
객체 프로퍼티 세팅은 어떤 객체에 프로퍼티를 새로 추가하거나 기존 프로퍼티 값을 바꾸는 것 이상의 의미  
```javascript
myObject.foo = "bar";
```
데이터 접근 프로퍼티 foo가 myObject 객체에 직속된 경우 이 할당문은 기존 프로퍼티 값을 고치는 단순 기능을 수행  
foo가 myObject에 속하지 않는다면 Get처럼 Prototype 연쇄를 순환하기 시작하고 그렇게 해도 foo가 발견되지 않으면 foo라는 프로퍼티를 myObject 객체에 추가한 후 주어진 값을 할당함  

foo가 Prototype의 상위 연쇄 어딘가에 존재하는 경우  
foo가 myObject 객체와 해당 객체의 prototype 연쇄 상위 수준 두 곳에서 동시에 발견될 경우 '가려짐(shadowing)'이라고 함  
myObject에 직속한 foo 때문에 상위 연쇄의 foo가 가려짐 - 연쇄의 최하위 수준에서 가장 먼저 foo 프로퍼티를 탐색하기 때문  
myObject 직속 foo는 없으나 myObject의 prototype 연쇄의 상위 수준에 foo가 있을 때 myObject.foo = "bar" 실행 결과에 대한 경우의 수  
1. Prototype 연쇄의 상위 수준에서 foo라는 이름의 일반 데이터 접근 프로퍼티가 존재하는데, 읽기 전용이 아닐 경우(writable:true), myObject의 직속 프로퍼티 foo가 새로 추가되어 결국 가려짐 프로퍼티가 됨
2. Prototype 연쇄의 상위 수준에서 발견한 foo가 읽기 전용(writable:false)이면 이 프로퍼티를 세팅하거나 myObject 객체에 가려짐 프로퍼티를 생성하는 일을 하지 않음. 엄격 모드에서 에러 발생, 비엄격 모드에서는 프로퍼티 세팅이 무시됨 -> 가려짐이 발생하지 않음
3. Prototype 연쇄의 상위 단계에서 발견된 foo가 세터일 경우 항상 이 세터가 호출됨. myObject에 가려짐 프로퍼티 foo를 추가하지 않으며 foo 세터를 재정의하는 일 또한 없음  

Prototype 연쇄의 상위 수준에 이미 존재하는 프로퍼티에 값 할당 시(Put) 가려짐이 반드시 발생되는 것이 아니라 1의 경우에만 해당됨  
2, 3번에서 foo를 가리려면 = 할당 연산자를 쓰면 안되고 Object.defineProperty()메서드를 사용하여 myObject에 foo를 추가해야 함  

메서드 간 위임이 필요한 상황이면 메서드 가려짐으로 인한 명시적 의사다형성 유발  
가려짐은 이용 가치에 비해 지나치게 복잡하고 애매 - 사용이 권장되지 않음

주의: 가려짐이 암시적으로 발생하는 경우
```javascript
var anotherObject = {
  a: 2
} 
var myObject = Object.create(anotherObject);
anotherObject.a; //2
myObject.a; //2

anotherObject.hasOwnProperty("a"); //true
myObject.hasOwnProperty("a"); //false

myObject.a++; //암시적 가려짐 발생

anotherObject.a; //2
myObject.a; //3

myObject.hasOwnProperty("a"); //true
```
++연산자는 myObject.a = myObject.a + 1 을 의미  
따라서 Prototype을 경유하여 Get을 먼저 찾고, anotherObject.a에서 현재 값 2를 얻은 뒤 1 증가 후, 그 결과값을 다시 Put으로 myObject에 새로운 가려짐 프로퍼티 a를 생성하고 할당  
위임을 통함 프로퍼티 수정 시 주의 필요  
anotherObject.a를 1만큼 증가시킬 의도라면 anotherObject.a++가 유일한 정답  

## 5.2 클래스
자바스크립트는 다른 클래스 지향 언어에서 제공하는 클래스라는 추상화된 패턴이나 설계는 없고 객체만 존재  
클래스에 객체의 작동을 서술하지 않고, 객체가 자신의 작동을 손수 정의함  

### 5.2.1 클래스 함수
모든 함수는 프로토타입이라는 공용(public), 열거 불가(nonenumerable) 프로퍼티를 지님
```javascript
function Foo() {
  //...
}
Foo.prototype; // {}
```
new Foo()로써 만들어진 모든 객체는 Foo.prototype 객체와 Prototype 링크로 연결됨
```javascript
function Foo() {
  //...
}
var a = new Foo();
Object.getPrototypeOf(a) === Foo.prototype; //true
```
클래스의 인스턴스화 - 클래스의 작동 계획을 실제 객체로 복사하는 것 -> 인스턴스마다 복사가 발생  

자바스크립트는 이러한 복사 과정이 전혀 없고 클래스에서 여러 인스턴스를 생성할 수 없음  
어떤 공용 객체에 Prototype으로 연결된 객체를 다수 생성하는 것은 가능, 그러나 기본적으로 어떠한 복사도 일어나지 않아서 결과적으로 자바스크립트에서 객체들은 서로 완전히 떨어져 분리되는 것이 아니라 끈끈하게 연결됨  
new Foo()로 새 객체가 생성되고 이 객체는 Foo.prototype 객체와 내부적으로 Prototope과 연결이 맺어짐 - 상호 연결된 두 객체로 귀결  
클래스 인스턴스화 과정(어떤 클래스로부터 작동을 복사하여 다른 객체로 넣음)은 없으며, 두 객체가 연결된 것이 전부  

new Foo() 호출 자체는 링크 생성 프로세스와 관련이 없음 -> 새 객체를 다른 객체와 연결하기 위한 간접적인 우회 방법  
Object.create()를 통해 직접적으로 연결  

#### 이름에는 무엇이 들어있을까?
자바스크립트는 어떤 객체(클래스)에서 다른 객체(인스턴스)로 복사하는 것이 아니라 두 객체를 연결  
Prototype 체계를 다른 말로 프로토타입 상속이라고 하며 흔히 클래스 상속의 동적 언어 버전이라고 함  
동적 스크립트 언어에 맞게 클래스 지향 언어의 상속 개념을 변형한 장치  

상속은 기본적으로 복사를 수반하지만, 자바스크립트는 객체 프로퍼티를 복사하지 않음  
두 객체에 링크를 걸어두고 한쪽이 다른 쪽의 프로퍼티/함수에 접근할 수 있게 위임함  

차등 상속 - 어떤 객체의 작동을 더 일반적인 객체와 비교했을 때 어느 부분이 다른지 기술하는 아이디어  

객체가 실제로 차등적으로 만들어지는 것이 아니라 아무것도 정의되지 않은 구덩이와 함께 특정 속성들을 정의함으로써 생성됨  
구덩이(정의가 빠진/부족한 빈자리)를 위임이 넘겨받아 상황에 맞게 위임받은 작동으로 채워 넣음  

자바스크립트 객체는 아무리 복사해도 하나의 차등 객체로 눌러지지 않으므로 차등 상속은 자바스크립트 Prototype 체계의 작동 원리를 설명하기 위한 이론으로는 부적합  

### 5.2.2 생성자
```javascript
function Foo() {
  //...
}
Foo.prototype.constructor === Foo; // true

var a = new Foo();
a.constructor === Foo; //true
```
Foo.prototype 객체에는 기본적으로 열거 불가한 공용 프로퍼티 .constructor가 세팅되는데, 이는 객체 생성과 관련된 함수(Foo)를 다시 참조하기 위한 레퍼런스  
생성자 호출 new Foo()로 생성한 객체 a도 .constructor 프로퍼티를 갖고 있어서 '자신을 생성한 함수'를 가리킬 수 있음  

#### 생성자냐 호출이냐?
함수는 생성자가 아니지만 앞에 new를 붙여 호출하는 순간 해당 함수는 '생성자 호출'을 함  
new 키워드는 일반 함수 호출을 도중에 가로채어 원래 수행할 작업 외에 객체 생성 과정을 더 추가하는 지시자  
```javascript
function NothingSpecial() {
  console.log("신경쓰지 마");
}
var a = new NothingSpecial(); //신경쓰지 마
a; // {}
```
NothingSpecial은 평범한 일반 함수  
이 함수를 new로 호출함으로써 객체가 생성되고 부수 효과로 생성된 객체를 변수 a에 할당함  
이것을 생성자 호출이라고 하지만 NothingSpecial 함수 자체는 생성자가 아님  
즉, 자바스크립트는 앞에 new를 붙여 호출함 함수를 모두 '생성자'라고 할 수 있음 -> 함수는 생성자가 아니지만 new를 사용하여 호출할 때에만 '생성자 호출'  

### 5.2.3 체계
자바스크립트에서의 클래스 지향 모방
```javascript
function Foo(name) {
  this.name = name;
}
Foo.prototype.myName = function() {
  return this.name
}
var a = new Foo("a");
var b = new Foo("b");

a.myName(); //a
b.myName(); //b
```
클래스 지향을 위한 두 가지 '꼼수'
1. this.name = name 할당 시 .name 프로퍼티가 a, b 두 객체에 추가됨. 클래스 인스턴스에서 뎅이터값을 캡슐화하는 모습과 유사
2. Foo.prototype.myName = ... -> 프로퍼티(함수)를 Foo.prototype 객체에 추가하여 a.myName()와 같이 사용  

a, b는 생성 직후 각자의 내부 Prototype이 Foo.prototype에 링크됨  
myName은 a, b에서 찾을 수 없으므로 위임을 통해 Foo.prototype에서 찾음

#### 돌아온 생성자
.constructor 프로퍼티 예제  
a.constructor === Foo가 true -> .constructor 역시 Foo.prototype에 위임된 레퍼런스로서 a.constructor는 Foo를 가리킴  
Foo에 의해 생성된 객체 a가 .constructor 프로퍼티를 통해 Foo에 접근할 수 있는 것은 편리해 보이지만 보안 측면에서 부적절  

.constructor가 '~에 의해 생성됨'이라는 가정은 부적절  
Foo.prototype의 .constructor 프로퍼티는 기본으로 선언된 Foo 함수에 의해 생성된 객체에만 존재함  
새로운 객체를 생성한 뒤 기본 .prototype 객체 레퍼런스를 변경하면 변경된 레퍼런스에도 .constructor가 따라붙지는 않음
```javascript
function Foo() {}
Foo.prototype = {}; //새 프로토타입 객체 생성

var a1 = new Foo();
a1.constructor === Foo; //false
a1.constructor === Object; //true
```
a1.constructor는 Foo가 아님 - Foo()는 생성의 주체가 아님  
a1에는 .constructor 프로퍼티가 없으므로 Prototype 연쇄를 따라 올라가 Foo.prototype 객체에 위임함  
그러나 이 객체에도 .constructor 프로퍼티가 없으므로 계속 상위 객체로 위임하다 연쇄의 가장 상위인 Object.prototype에 도달  
Object.prototype은 .constructor을 갖고 있으므로 결국 내장 Object() 함수를 가리키게 됨  

Foo.prototype 객체에 .constructor을 넣을 수는 있으나 별도 코딩이 수반됨  
```javascript
function Foo() {}
Foo.prototype = {}; //새 프로토타입 객체 생성

// 새 객체에서 사라진 '.constructor' 프로퍼티를 'Foo.prototype'에 추가하여 해결
Object.defineProperty(Foo.prototype, "constructor", {
  enumerable: false,
  writable: true,
  configurable: true,
  value: Foo //.constructor가 Foo를 가리키게 함
});
```
생성자는 생성됨을 의미하지 않음  

.constructor는 불변 프로퍼티가 아님 - 열거 불가지만 값은 쓰기 가능, Prototype 연쇄에 존재하는 'constructor'라는 이름의 프로퍼티를 추가하거나 다른 값으로 덮어쓰기 가능  

따라서 a1.constructor와 같은 임의의 객체 프로퍼티는 실제로 기본 함수를 참조하는 레퍼런스라는 보장이 전혀 없음  
또 a1.constructor는 전혀 엉뚱한 곳을 가리킬 가능성도 존재  
a1.constructor는 매우 불안정하고 신뢰도가 낮은 레퍼런스이므로 가급적 사용하지 않는 것이 좋음 

## 5.3 프로토타입 상속
a1 -> Foo.prototype 뿐만 아니라 Bar.prototype -> Foo.prototype으로도 위임 - 부모-자식 클래스 간 상속 개념과 유사  
위임 링크를 생성하는 전형적인 프로토타입 스타일의 코드 예시
```javascript
function Foo(name) {
  this.name = name;
}

Foo.prototype.myName = function() {
  return this.name;
};

function Bar(name, label) {
  Foo.call(this, name);
  this.label = label;
}

// Bar.prototype을 Foo.prototype에 연결
Bar.prototype = Object.create(Foo.prototype);
// Bar.prototype.constructor는 사라짐 -> 이 프로퍼티에 의존하는 코드가 있다면 수동으로 처리해야 함

Bar.prototype.myLabel = function() {
  return this.label;
};

var a = new Bar("a", "obj a");

a.myName(); //a
a.myLabel(); //obj a
```
Object.create() 실행 시 새로운 객체를 생성하고 내부 Prototype을 지정한 객체(Foo.prototype)에 링크  
-> Foo.prototype과 연결된 새로운 Bar.prototype 객체를 생성  
Bar(){} 함수를 선언하면 Bar는 다른 함수들처럼 기본적으로 .prototype 링크를 자신의 객체에 갖고 있음  
Foo.prototype과 연결하기 위하여 애초에 연결된 객체와 단절하고 Foo.prototype과 연결된 새로운 객체를 생성  

위의 과정에 대한 의도대로 되지 않는 코드 예시
```javascript
Bar.prototype = Foo.prototype; // 효과 x
Bar.prototype = new Foo(); // 의도한 대로 작동될 수 있으나 예상치 못한 부수 효과 발생 가능성
```
Bar.prototype = Foo.prototype와 같이 할당을 해도 Bar.prototype이 링크된 새로운 객체가 생성되지는 않음  
Bar.prototype을 Foo.prototype을 가리키는 부가적인 레퍼런스로 만들어 사실상 Foo에 링크된 Foo.prototype 객체와 직접 연결  
따라서 myLabel = ... 와 같은 할당문을 실행하면 별도의 객체가 아닌 공유된 Foo.prototype 객체 자체를 변경, Foo.prototype과 연결된 모든 객체에 영향을 끼침  

Bar.prototype = new Foo()로 할당 시 Foo.prototype과 링크된 새 객체가 생성되지만 Foo()를 생성자 호출함  
Foo 함수 본문이 내부적인 부수효과(로깅, 상태 변경, 타 객체에 등록 처리, 데이터 프로퍼티를 this에 추가 등)를 포함한다면 연결 고리가 성립되는 시점에 부수 효과도 함께 발생  
Object.create()를 사용하여 Foo()의 부수효과 발생 방지  

ES6 이전 - .__proto__ 프로퍼티를 거친 비표준적/비호환 방법으로 기존 객체의 연결 정보를 수정  
ES6 이후 Object.setPrototypeOf() 유틸리티를 통한 예측 가능한 표준 방법 수행
```javascript
//ES6 이전: 기존 기본 Bar.prototype를 던짐
Bar.prototype = Object.create(Foo.prototype);

//ES6 이후: 기존 Bar.prototype을 수정
Object.setPrototypeOf(Bar.prototype, Foo.prototype);
```

### 5.3.1 클래스 관계 조사
인트로스펙션(introspection), 리플렉션(reflection): 전통적인 클래스 지향 언어에서(자바스크립트는 객체) 인스턴스의 상속 계통(위임 링크)을 살펴보는 것  
```javascript
function Foo() {
  //...
}

Foo.prototype.blah = ...;
var a = new Foo();
```
a의 계통(위임 링크) 확인
```javascript
a instanceof Foo; //true
```
instanceof 연산자: 왼쪽에는 일반 객체, 오른쪽에는 함수 피연산자  
a의 Prototype 연쇄를 순회하면서 Foo.prototype이 가리키는 객체가 있는지를 조사  
대상 함수(.prototype 레퍼런스가 붙은 Foo)에 대해 주어진 객체(a)의 계통만 확인함  
2개의 객체가 있다면 instanceof 만으로는 두 객체가 서로 Prototype 연쇄를 통해 연결되어 있는지를 확인할 수 없음  

클래스와 instanceof의 의미에 대한 오해로부터 발생할 수 있는 추론
```javascript
// o1이 o2와 연관되는지(o2에 위임되는지) 확인하는 헬퍼 유틸리티
function isRelatedTo(o1, o2) {
  function F(){}
  F.prototype = o2;
  return o1 instanceof F;
}
var a = {};
var b = Object.create(a);

isRelatedTo(b, a); //true
```
isRelatedTo() 내부에서 생성한 임시 함수 F의 .prototype이 o2 객체를 참조하게 하고 o1이 F의 인스턴스인지 확인함  
o1은 F를 상속하거나 F에서 파생된 객체가 아니므로 이러한 로직은 혼란 초래  
instanceof 의미를 끼워 맞춰 클래스 본래 의미를 자바스크립트에 강제로 적용하고자 하는 데서 부자연스러움을 초래  

Prototype 리플렉션 확인을 위한 대안
```javascript
Foo.prototype.isPrototypeOf(a); //true
```
Foo가 어떤 함수든 상관없이 다른 객체 테스트 시 사용할 객체만 있으면 됨  
isPrototypeOf() - a의 전체 Prototype 연쇄에 Foo.prototype이 있는지를 확인함  
간접적으로 참조할 함수(Foo)의 .prototoype 프로퍼티를 거치는 등의 과정이 생략되는 장점  
관계를 확인하고 싶은 객체를 2개 기입
```javascript
// c의 Prototype 연쇄 어딘가에 b가 존재하는지를 확인
b.isPrototypeOf(c);
```
따라서 함수(클래스)는 전혀 필요하지 않음  
b와 c를 직접 참조하는 객체 레퍼런스를 이용하여 둘의 관계를 확인하는 것이 전부  

ES5부터 지원하는 표준 메서드 - 객체 Prototype을 곧바로 조회
```javascript
Object.getPrototypeOf(a);

// 확인
Object.getPrototypeOf(a) === Foo.prototype; //true
```
대부분 브라우저에서는 내부의 Prototype을 확인할 수 있는 비표준 접근 방법을 지원해옴
```javascript
a.__proto__ === Foo.prototype; //true
```
프로토타입 연쇄를 직접 확인하고자 할 때 __proto__는 유용함  

__proto__는 객체(a)에 실재하는 프로퍼티는 아님  
다른 공용 유틸리티(.toString(), .isPrototypeOf() 등)와 더불어 내장 객체 Object.prototoype에 존재함  
프로퍼티처럼 보이나 게터/세터에 가까움  
__proto__의 실 구현체 코드
```javascript
Object.defineProperty(Object.prototype, "__proto__", {
  get: function() {
    return Object.getPrototypeOf(this);
  },
  set: function(o) {
    // ES6부터 setPrototypeOf()를 사용
    Object.setPrototypeOf(this, o);
    return o;
  }
});
```
a.__proto__로 접근(값 조회)하는 것은 a.__proto__()를 (게터 함수) 호출하는 것과 같음  
게터 함수는 Object.prototype 객체에 존재하지만 이 함수를 호출하면 this는 a로 바인딩되며 결국 Object.getPrototypeOf(a)를 실행시키는 것과 비슷함  
.__proto__ 프로퍼티는 Object.setPrototypeOf()를 사용하여 세팅 가능하나 이미 존재하는 객체의 Prototype은 가급적 변경하지 않는 것이 좋음  

예외 - 기본 함수의 .prototype 객체가 (Object.prototype을 제외한) 또 다른 객체를 참조하도록 Prototype을 세팅하는 경우  
원래 객체가 새로운 연결 구조의 객체로 바뀌는 것을 방지할 수 있음  
이외에는 혼돈 유발 가능성 - Prototype 링크 정보는 읽기 전용으로 다루는 것이 최선  

## 5.4 객체 링크
Prototype 체계 - 다른 객체를 참조하는 어떤 객체에 존재하는 내부 링크  
이 연결 고리는 객체의 프로퍼티/메서드 참조를 시도, 프로퍼티/메서드가 해당 객체에 존재하지 않을 때 주로 활용됨  
프로토타입 연쇄 - 객체 사이에 형성된 일련의 링크  
엔진은 Prototype에 연결된 객체를 하나씩 따라가면서 프로퍼티/메서드를 찾아보고 발견될 때까지 같은 과정을 되풀이함

### 5.4.1 링크 생성
```javascript
var foo = {
  something: function() {
    console.log("show me something special");
  }
};
var bar = Object.create(foo);
bar.something(); //show me something special
```
Object.create()는 먼저 새로운 객체(bar)를 생성하고 주어진 객체(foo)와 연결함  
두 객체에 의미 있는 관계를 맺어주는 데 클래스가 필수적인 것은 아님  
객체의 위임 연결 처리가 중요.  Object.create() 덕분에 클래스 뭉치 없이도 깔끔한 처리가 가능

Object.create(null): Prototype 링크가 빈 객체를 생성 -> 위임할 곳이 전혀 없음  
프로토타입 연쇄 자체가 존재하지 않기 때문에 instanceof 연산 결과는 항상 false  
빈 Prototype을 가진 객체는 Prototype이 위임된 프로퍼티/함수들로부터 어떠한 영향도 받지 않으면서 일차원적인 데이터 저장소 역할 가능  
순수하게 프로퍼티에 데이터를 저장하는 용도로 사용 - 딕셔너리

#### Object.create() 폴리필
ES5 이전 환경을 고려하여 Object.create() 폴리필 필요
```javascript
if(!Object.create) {
  Object.create = function(o) {
    function F() {}
    F.prototype = o;
    return nre F();
  };
}
```
임시 함수 F를 이용하여 F.prototype 프로퍼티가 링크하려는 객체를 가리키도록 오버라이드, 그 후 new F()로 원하는 연결이 수립된 새 객체를 반환  

ES5 표준 내장 메서드 Object.create()의 추가 기능
```javascript
var anotherObject = {
  a: 2
};

var myObject = Object.create(anotherObject, {
  b: {
    enumerable: false,
    writable: true,
    configurable: false,
    value: 3
  },
  c: {
    enumerable: true,
    writable: false,
    configurable: false,
    value: 4
  }
});
myObject.hasOwnProperty("a"); //false
myObject.hasOwnProperty("b"); //true
myObject.hasOwnProperty("c"); //true

myObject.a; //2
myObject.b; //3
myObject.c; //4
```
Object.create()의 두 번째 인자 - 새로 만든 객체에 추가할 프로퍼티. 각자 프로퍼티 서술자를 기재하여 속성 지정 가능  
ES5 이전 환경에서는 프로퍼티 서술자 폴리필이 불가능 - Object.create()의 추가기능까지 폴리필은 불가능  
완전한 폴리필을 위한 추가적인 유틸리티
```javascript
function createAndLinkObject(o) {
  function F(){}
  F.prototype = o;
  return new F();
}

var anotherObject = {
  a: 2
};

var myObject = createAndLinkObject(anotherObject);
myObject.a; //2
```
엄격하게 적용할 필요는 없음. ES5 이전 환경에서 Object.create()의 부분 폴리필은 문제 없이 작동하나, 판단은 사용자의 몫

### 5.4.2 링크는 대비책?
객체 간 연결 시스템은 프로퍼티/메서드를 찾지 못할 경우를 위한 대비책이 아님
```javascript
var anotherObject = {
  cool: function() {
    console.log("good");
  }
};
var myObject = Object.create(anotherObject);
myObject.cool(); //good
```
Prototype 덕분에 이 코드는 에러 없이 실행되나, 다른 개발자에 의해 myObject에 프로퍼티/메서드가 없는 것에 대한 대비책으로 anotherObject가 작성된다면 코드는 작동되지만 분석이나 유지보수의 어려움은 증가  
적절한 디자인 패턴이 아니므로 사용을 자제하고 다른 합리적인 방법 탐구 필요  

Prototype 링크를 활용하는 방법
```javascript
var anotherObject = {
  cool: function() {
    console.log("good");
  }
};
var myObject = Object.create(anotherObject);
myObject.doCool = function() {
  this.cool(); //내부 위임
}
myObject.doCool(); //good
```
myObject.doCool() 메서드는 myObjcet에 실제로 존재하므로 더 명시적인 API  
내부적으로 Prototype을 anotherObject.cool()에 위임한 위임 디자인 패턴의 구현 방식  
API 인터페이스 설계 시 구현 상세를 겉으로 노출하지 않고 내부에 감추는 식으로 위임하면 혼동의 가능성은 적음  