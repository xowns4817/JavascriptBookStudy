# 객체

## 3.1 구문
객체 - 선언적(리터럴) 형식과 생성자 형식  
리터럴 형식
```javascript
var myObj = {
  key: value
}
```
생성자 형식
```javascript
var myObj = new Object();
myObj.key = value;
```
결과적으로 생성되는 객체는 동일  
차이점 - 리터럴 형식은 한 번의 선언으로 다수의 키/값 쌍을 프로퍼티로 추가 가능, 생성자 형식은 한 번에 한 프로퍼티만 추가 가능

## 3.2 타입
자바스크립트 객체의 주요 타입
- null
- undefined
- boolean
- number
- string
- object
- symbol(ES6 추가)  

단순 원시 타입은 객체가 아님  
null의 경우, type of null의 결과가 object이지만 실제로 객체는 아님(언어 자체의 버그)  

복합 원시 타입 - 객체의 하위 타입  
function - 호출 가능한 객체. 일급(first class)이며, 일반 객체와 똑같이 취급됨  
일급: 다른 함수에 인자로 전달 가능. 다른 함수로부터 함수를 반환받을 수 있으며, 함수 자체를 변수에 할당하거나 자료 구조에 저장 가능  
배열 - 추가 기능이 구현된 객체의 일종. 다른 일반 객체보다 더 조직적으로 데이터가 구성됨

### 3.2.1 내장 객체
객체 하위 타입 일종  
단순 원시 타입과 연관있어 보이지만 실제 관계는 더 복잡
- String
- Number
- Boolean
- Object
- Function
- Array
- Date
- RegExp
- Error  

타입과 유사하면서 타 언어의 클래스처럼 보이지만 자바스크립트에서는 내장함수  
생성자(new 연산자를 통한 호출)로 사용되어 주어진 하위 타입의 새 객체를 생성함
```javascript
var strPrimitive = "I'm string";
typeof strPrimitive; //"string"
strPrimitive instanceof String; //false

var strObject = new String("I'm string");
typeof strObject; //"object"
strObject instanceof String; //true

// 객체 하위 타입 확인
Object.prototype.toString.call(strObject); //[object String]
//toString() 메서드의 기본 구현체를 빌려서 내부 하위 타입 조사
```
문자열 원시 값은 객체가 아닌 원시 리터럴이며 불변값  
문자 개수를 세는 등 문자별로 접근 시 String 객체가 필요  
자바스크립트 엔진은 상황에 맞게 문자열 원시 값을 String 객체로 자동 강제변환. 명시적으로 객체를 생성하는 경우는 거의 없음  
```javascript
var strPrimitive = "I'm string";
console.log(strPrimitive.length); //10
console.log(strPrimitive.charAt(4)); //s
```
숫자 리터럴에 메서드를 호출해도 new Number() 객체 래퍼로 강제 변환되며, 불리원 원시 값도 Boolean 객체로 변환됨  
Objects, Arrays, Functions, RegExps는 형식과 무관하게 모두 객체  
생성자 형식은 리터럴 형식보다 옵션이 더 많은 편  
결국 생성되는 객체는 동일하므로 더 간단한 리터럴 형식이 많이 사용됨  
Error 객체는 예외 발생 시 자동으로 생성됨 - 명시적으로 생성하는 경우는 거의 없음(new Error()로 생성은 가능)

## 3.3 내용
객체는 특정한 위치에 저장된 모든 타입의 값(프로퍼티의 내용)이 채워짐  
엔진이 값을 저장하는 방식은 구현 의존적(implementation-dependent)  
객체 컨테이너에 담지 않는 것이 일반적  
객체 컨테이너에는 실제 프로퍼티 값이 있는 곳을 가리키는 포인터(레퍼런스) 역할을 담당하는 프로퍼티명이 포함됨
```javascript
var myObject = {
  a: 2
};

myObject.a; //2
myObject["a"]; //2
```
myObject 객체에서 a 위치 값에 접근하기 위해 '.' 연산자 또는 '[]' 연산자 사용  
.a 구문 - 프로퍼티 접근, ["a"] 구문 - 키 접근  
.연산자는 뒤에 식별자 호환 프로퍼티명이 와야 하지만 [""] 구문은 UTF-8/유니코드 호환 문자열이라면 모두 프로퍼티명으로 사용 가능  
```javascript
var myObject = {
  a: 2
};
var idx;
if(wantA) {
  idx = "a";
}

console.log(myObject[idx]); //2
```
객체 프로퍼티명은 언제나 문자열  
문자열 이외 다른 원시값 사용 시 우선 문자열로 변환됨  
배열 인덱스 숫자도 동일
```javascript
var myObject = {};
myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"]; //foo
myObject["3"]; //bar
myObject["[object Object]"]; //baz
```

### 3.3.1 계산된 프로그래밍
myObject[] 프로퍼티 접근 구문은 myObject[prefix + name] 형태 계산식 값으로 키 이름을 나타낼 때는 유용, 그러나 리터럴 구문으로 객체 선언 시에는 그렇지 않음  
ES6의 계산된 프로퍼티명(computed property names) 기능 - 객체 리터럴 선언 구문의 키 이름 부분에 해당 표현식 추가 후 []로 감쌈
```javascript
var prefix = "foo";
va rmyObject = {
  [prefix + "bar"]: "hello",
  [prefix + "baz"]: "world"
};

myObject["foobar"]; //hello
myObject["foobaz"]; //world
```
계산된 프로퍼티명은 ES6 심볼에서 많이 사용 가능  
심볼 - 새로운 원시 데이터 타입이 불분명하고 예측 불가능한 값을 지님  
심볼의 실제 값을 직접 다룰 일은 거의 없으므로 Symbol.Something(임의의 이름임)과 같은 심볼명을 사용
```javascript
var myObject = {
  [Symbol.Something]: "hello world"
};
```

### 3.3.2 프로퍼티 vs 메서드
함수는 객체에 속하지 않음 - 객체 레퍼런스로 접근한 함수를 메서드라고 칭하며 구분할 필요는 없음  
객체에 존재하는 프로퍼티에 접근할 때마다 반환 값 타입에 상관없이 항상 프로퍼티 접근을 하고 이런 식으로 함수를 가져왔다고 해서 함수가 메서드가 되는 것은 아님
```javascript
function foo() {
  console.log("foo");
}
var someFoo = foo;
var myObject = {
  someFoo: foo
};
foo;
someFoo;
myObject.someFoo;
```
모두 같은 함수를 가리키는 개별 레퍼런스일 뿐, 특별한 다른 객체가 소유한 함수는 아님  
foo() 안데 this 레퍼런스가 정의되어 있다면 myObject.someFoo에서 발생할 암시적 바인딩이 두 레퍼런스 간 유일한 차이점  
자바스크립트에서 함수와 메서드라는 용어는 혼용 가능  

ES6부터 super 레퍼런스가 추가되어 class와 함께 사용 가능 - this 같은 뒤늦은 바인딩이 아니라 정적 바인딩 방식이 작동하므로 함수보다는 메서드에 더 가까운 super 바인딩 함수. 그러나 의미상, 체계상 차이는 존재  

함수 표현식을 객체 리터럴의 한 부분으로 선언해도 저절로 함수가 객체에 달라붙는 것은 아니며 해당 함수 객체를 참조하는 레퍼런스가 하나 더 생기는 것 뿐임
```javascript
var myObject = {
  foo: function() {
    console.log("foo");
  }
};
var someFoo = myObject.foo;
someFoo;
myObject.foo;
```

### 3.3.3 배열
값을 저장하는 방법과 장소가 더 체계적인 객체 형태  
숫자 인덱싱 - 인덱스라는 양수로 표기된 위치에 값을 저장
```javascript
var myArray = ["foo", 42, "bar"];
myArray.length;
myArray[0];
myArray[2];
```
배열 자체는 객체 - 배열에 프로퍼티 추가 가능
```javascript
var myArray = ["foo", 42, "bar"];
myArray.baz = "baz";
myArray.length; //3
myArray.baz;
```
키/값 저장소로는 객체, 숫자 인덱스를 가진 저장소로는 배열을 쓰는 것이 좋음 - 정해진 용도에 최적화되어 작동하기 때문  

주의 - 배열 프로퍼티 추가 시 프로퍼티명이 숫자와 유사하다면 숫자 인덱스로 잘못 해석되어 배열 내용이 달라질 수 있음
```javascript
var myArray = ["foo", 42, "bar"];
myArray["3"] = "baz";
myArray.length; //4
myArray[3]; //"baz"
```

### 3.3.4 객체 복사
```javascript
function anotherFunction() {/**/}
var anotherObject = {
  c: true
};
var anotherArray = [];

var myObject = {
  a: 2,
  b: anotherObject,
  c: anotherArray,
  d: anotherFunction
  // 사본이 아닌 레퍼런스
};
anotherArray.push(anotherObject, myObject);
```
객체의 사본 - 얕은 복사 / 깊은 복사  
얕은 복사 후 생성된 새 객체의 a 프로퍼티는 원래 값 2가 그대로 복사되지만 b, c, d 프로퍼티는 원 객체의 레퍼런스와 같은 대상을 가리키는 또 다른 레퍼런스  
깊은 복사를 하면 myObject와 anotherObject, anotherArray까지 모두 복사됨  
그러나 anotherArray가 anotherObject와 myObject를 가리키는 레퍼런스를 갖고 있으므로 원래 레퍼런스가 보존되는 것이 아니라 함께 복사됨 -> 환형 참조 형태  

JSON-safe 객체(JSON 문자열 <-> 객체 직렬화 및 역 직렬화 => 구조와 같이 같은 객체) - 객체 복사 문제에 대한 하나의 대안
```javascript
var new Obj = JSON.parse(JSON.stringify(someObj));
```
ES6부터 얕은 복사에 대해 Object.assign() 메서드 제공  
첫 인자는 타깃 객체, 두 번째 인자 이후는 하나 또는 둘 이상의 소스 객체  
소스 객체의 모든 열거 가능한 것과 보유 키를 순회하면서 타깃 객체로 복사함
```javascript
var newObj = Object.assign({}, myObject);
newObj.a;
newObj.b === anotherObject; //true
newObj.c === anotherArray; //true
newObj.d === anotherFunction; //true
```

### 3.3.5 프로퍼티 서술자
ES5부터 모든 프로퍼티는 프로퍼티 서술자로 표현됨
```javascript
var myObject = {
  a: 2
};
Object.getOwnPropertyDescriptor(myObject, "a");
//{ value: 2, writable: true, enumerable: true, configurable: true }
```
Object.defineProperty()로 새로운 프로퍼티를 추가하거나 기존 프로퍼티 특성을 수정(configurable이 true일 때만 가능)할 수 있음  
```javascript
var myObject = {};
Object.definedProperty(myObject, "a", {
  value: 2,
  writable: true,
  configurable: true,
  enumerable: true
});
myObject.a; //2
```

#### 쓰기 가능
프로퍼티 값의 쓰기 가능(writable) 여부는 writable로 조정
```javascript
var myObject = {};
Object.definedProperty(myObject, "a", {
  value: 2,
  writable: false,
  configurable: true,
  enumerable: true
});
myObject.a = 3;
myObject.a; //2
```
엄격모드에서는 쓰기 금지 값 수정 시도 시 에러 발생
```javascript
"use strict";
var myObject = {};
Object.definedProperty(myObject, "a", {
  value: 2,
  writable: false,
  configurable: true,
  enumerable: true
});
myObject.a = 3; //TypeError
```

#### 설정 가능
프로퍼티가 설정 가능(configurable)하면 defineProperty()로 프로퍼티 서술자 변경 가능
```javascript
var myObject = {
  a: 2
};
myObject.a = 3;
myObject.a; //3

Object.defineProperty(myObject, "a", {
  value: 4,
  writable: true,
  configurable: false,
  enumerable: true
});
myObject.a; //4
myObject.a = 5;
myObject.a; //5

Object.defineProperty(myObject, "a", {
  value: 6,
  writable: true,
  configurable: true,
  enumerable: true
}); //TypeError
```
configurable을 false로 설정하면 복구될 수 없으며 delete 연산자로 존재하는 프로퍼티 삭제도 금지됨. 사용시 주의  
```javascript
var myObject = {
  a: 2
};
myObject.a; //2

delete myObject.a;
myObject.a; //undefined

Object.defineProperty(myObject, "a", {
  value: 2,
  writable: true,
  configurable: false,
  enumerable: true
});
myObject.a; //2
delete myObject.a;
myObject.a; //2
```
delete - 객체에서 (삭제 가능한) 프로퍼티를 곧바로 삭제하는 용도로만 쓰임  
해당 프로퍼티가 어떤 객체/함수를 가리키는 마지막 레퍼런스면 레퍼런스가 삭제되면서 결국 객체/함수는 아무것도 참조하지 않게 되어 가비지 컬렉션의 대상이 됨  

#### 열거 가능성
enumerable - for...in 루프와 같이 객체 프로퍼티를 열거하는 구문에서 해당 프로퍼티의 표출 여부를 나타냄  
enumerable: false로 지정된 프로퍼티는 접근할 수는 있지만 루프 구문에서 감춰짐  
기본 값을 true이기 때문에 열거 가능. 감추고 싶은 프로퍼티에 한하여 false로 세팅  

### 3.3.6 불변성
프로퍼티/객체가 변경되지 않게 해야할 경우  
얕은 불변성만 지원 - 객체 자신과 직송 프로퍼티 특성만 불변으로 만들 뿐 다른 객체(배열, 객체, 함수 등)를 가리키는 레퍼런스가 있을 때 해당 객체의 내용까지 불변으로 만들지는 못함
```javascript
myImmutableObject.foo; //[1, 2, 3]
myImmutableObject.foo.push(4);
myImmutableObject.foo; //[1, 2, 3, 4]
```
myImmutableObject는 불변 객체로 생성되어 보호되지만 myImmutableObject.foo의 내용까지 보호하려면 foo를 불변 객체로 바꿔야 함

#### 객체 상수
writable:false와 configurable:false를 같이 쓰면 객체 프로퍼티를 상수처럼 사용 가능
```javascript
var myObject = {};
Object.defineProperty(myObject, "FAVORITE_NUMBER", {
  value: 42,
  writable: false,
  configurable: false
});
```
#### 확장 금지
객체에 프로퍼티를 추가할 수 없게 차단하고 현재 프로퍼티는 있는 그대로 두기 위해 Object.preventExtensions 사용  
비엄격 모드에서는 추가에 실패, 엄격 모드에서는 TypeError 발생
```javascript
var myObject = {
  a: 2
};
Object.preventExtensions(myObject);
myObject.b = 3;
myObject.b; //undefined
```
#### 봉인
Object.seal() - 봉인된 객체를 생성  
어떤 객체에 대해 Object.preventExtensions()를 실행하고 프로퍼티를 전부 configurable:false 처리  
결과적으로 더는 프로퍼티를 추가할 수 없고, 기존 프로퍼티를 재설정하거나 삭제도 불가. 값은 변경 가능
#### 동결
Object.freeze() - Object.seal()을 적용하고 데이터 접근자 프로퍼티를 모두 writable:false 처리  
가장 높은 단계의 불변성을 적용한 것 - 객체와 직속 프로퍼티에 어떤 변경도 원천 봉쇄  
전혀 영향을 받지 않았던 해당 객체가 참조하는 모든 객체를 재귀 순회하면서 Object.freeze()를 적용하여 깊숙이 동결함. 그러나 의도하지 않은 다른 공유된 객체까지 동결시킬 수 있어 주의 필요

### 3.3.7 [[Get]]
```javascript
var myObject = {
  a: 2
};
myObject.a; //2
```
a라는 이름의 프로퍼티를 myObject에서 찾는 것이 아니라, 실제로는 myObject에 대헤 Get 연산 수행  
Get 연산 - 주어진 이름의 프로퍼티를 먼저 찾아보고 있다면 그 값을 반환  
주어진 프로퍼티 값을 찾을 수 없으면 Get 연산은 undefined를 반환
```javascript
var myObject = {
  a: 2
};
myObject.b; //undefined
```
식별자명으로 변수 참조 시에는 작동 방식이 다름  
해당 렉시컬 스코프 내에 없는 변수를 참조하면 객체 프로퍼티처럼 undefined를 반환하지 않고 ReferenceError 발생
```javascript
var myObject = {
  a: undefined
};
myObject.a; //undefined
myObject.b; //undefined
```
값은 둘 다 undefined로 같아 보이지만, 내부적으로는 Get 연산 수행 -> 대체로 myObject.b가 myObject.a보다 더 많은 동작이 수행됨  

### 3.3.8 [[Put]]
Put 실행 시 주어진 객체에 프로퍼티가 존재하는지 등 여로 요소에 따라 이후 작동 방식이 달라짐  
Put 알고리즘은 이미 존재하는 프로퍼티에 대해 다름의 확인 절차를 밟음
1. 프로퍼티가 접근 서술자라면 세터를 호출
2. 프로퍼티가 writable:false인 데이터 서술자라면 비엄격 모드에서 조용히 실패, 엄격 모드에서 TypeError 발생
3. 이 외에는 프로퍼티에 해당 값을 세팅함  
객체에 존재하지 않는 프로퍼티라면 Put 알고리즘은 더 복잡해짐

### 3.3.9 게터와 세터
Put과 Get 기본 연산은 이미 존재하거나 전혀 새로운 프로퍼티에 값을 세팅하거나 기존 프로퍼티로부터 값을 조회하는 역할을 담당  
ES5부터 게터/세터를 통해 (객체 수준이 아닌) 프로퍼티 수준에서 이러한 기본 로직을 오버라이드할 수 있음  
게터/세터 - 각각 실제로 값을 가져오는/세팅하는 감춰진 함수를 호출하는 프로퍼티  
접근 서술자 - 프로퍼티가 게터 또는 세터 어느 한쪽이거나 동시에 게터/세터가 될 수 있게 정의한 것  
접근 서술자에서는 프로퍼티의 값과 writable 속성은 무시되며 대신 (configurable, enumerable과 더불어) 프로퍼티의 Get/Set 속성이 중요
```javascript
var myObject = {
  // 'a'의 게터를 정의
  get a() {
    return 2;
  }
};

Object.defineProperty(
  myObject,   // target
  "b",        // 프로퍼티명
  {           // 서술자
    // 'b'의 게터를 정의
    get: function() { return this.a * 2 },
    
    // 'b'가 객체 프로퍼티로 확실히 표시되게 함
    enumerable: true
  }
);
myObject.a; //2
myObject.b; //4
```
get a() {} 처럼 리터럴 구문으로 기술하거나, definedProperty()로 명시적 정의를 내리든 실제로 값을 가지고 있지 않은 객체에 프로퍼티를 생성하는 것은 같지만 프로퍼티에 접근하면 자동으로 게터 함수를 은밀하게 호출하여 어떤 값이라도 게터 함수가 반환한 값이 결과값이 됨
```javascript
var myObject = {
  // 'a'의 게터를 정의
  get a() {
    return 2;
  }
};
myObject.a = 3;
myObject.a; //2
```
a의 게터가 정의되어 있으므로 할당문으로 값을 세팅하려 하면 에러 없이 무시됨  
세터가 있어도 커스텀 게터가 2만 반환하게 하드 코딩되어 있어서 세팅은 무효화  
프로퍼티 단위로 기분 Put 연산을 오버라이드하는 세터가 정의되어야 함 -> 게터와 세터는 항상 둘 다 선언하는 것이 좋음
```javascript
var myObject = {
  // 'a'의 게터를 정의
  get a() {
    return this._a_;
  },
  set a(val) {
    this._a_ = val * 2;
  }
};
myObject.a = 2;
myObject.a; //4
```
주어진 값 2는 실제로 다른 변수 _a_에 할당(Put 연산). '_a_'라는 명칭은 관례상 붙인 것. 실제 로직과는 무관한 일반 프로퍼티임

### 3.3.10 존재 확인
프로퍼티 접근 시 결과값이 undefined인 경우 - 원래 프로퍼티 값이 undefined거나 해당 객체에 프로퍼티가 없는 것  
두 경우를 구분하는 방법
```javascript
var myObject = {
  a: 2
};
("a" in myObject); //true
("b" in myObject); //false

myObject.hasOwnProperty("a"); //true
myObject.hasOwnProperty("b"); //false
```
in 연산자 - 어떤 프로퍼티가 해당 객체에 존재하는지 또는 해당 객체의 Prototype 연쇄를 따라갔을 때 상위 단계에 존재하는지 확인  
hasOwnProperty() - 단지 프로퍼티가 객체에 있는지만 확인, Prototype 연쇄는 찾지 않음  
대부분의 일반 객체는 Object.prototype 위임을 통해 hasOwnPerperty()에 접근할 수 있지만 Object.prototype과 연결되지 않은 객체는 myObject.hasOwnProperty()처럼 사용 불가. 이런 경우 Object.prototype.hasOwnProperty.call(myObject, "a")와 같이 기본 hasOwnPerperty() 메서드를 빌려와 myObject에 대해 명시적으로 바인딩하여 확인

#### 열거
enumerable의 열거 가능성 개념
```javascript
var myObject = {};
Object.defineProperty(
  myObject,
  "a",
  // 'a'를 열거가 가능하게 세팅(기본값)
  { enumerable: true, value: 2 }
);
Object.defineProperty(
  myObject,
  "b",
  // 'b'를 열거가 불가능하게 세팅
  { enumerable: false, value: 3 }
);
myObject.b; //3
("b" in myObject); //true
myObject.hasOwnProperty("b"); //true

//...

for (var k in myObject) {
  console.log(k, myObject[k]);
}
//"a" 2
```
myObject.b는 실제 존재하는 프로퍼티로 값에도 접근 가능하나 for...in 루프에서 확인되지 않음  
'열거 가능(enumerable)'하다 - 객체 프로퍼티 순회 리스트에 포함된다는 뜻  

프로퍼티가 열거 가능한지 확인할 수 있는 다른 방법
```javascript
var myObject = {};
Object.defineProperty(
  myObject,
  "a",
  // 'a'를 열거가 가능하게 세팅(기본값)
  { enumerable: true, value: 2 }
);
Object.defineProperty(
  myObject,
  "b",
  // 'b'를 열거가 불가능하게 세팅
  { enumerable: false, value: 3 }
);
myObject.propertyIsEnumerable("a"); //true
myObject.propertyIsEnumerable("b"); //false

Object.keys(myObject); //["a"]
Object.getOwnPropertyNames(myObject); //["a", "b"]
```
propertyIsEnumerable() - 어떤 프로퍼티가 해당 객체의 직속 프로퍼티인 동시에 enumerable:true 인지를 검사  
Object.keys() - 객체에 있는 모든 열거 가능한 프로퍼티를 배열 형태로 반환  
in과 hasOwnProperty()가 Prototype 연쇄 확인에 따라 차이가 있는 반면, Object.keys()와 Object.getOwnPropertyNames는 모두 주어진 객체만 확인  

## 3.4 순회
for...in 루프 - 열거 가능한 객체 프로퍼티를(Prototype 연쇄 포함) 차례로 순회
```javascript
var myArray = [1, 2, 3];
for (var i = 0; i < myArray.length; i++) {
  console.log(myArray[i]);
}
```
인덱스를 순회하면서 해당 값을 사용할 뿐 값 자체를 순회하는 것은 아님  

ES5 이후 forEach(), every(), some() 등의 배열 관련 순회 헬퍼 도입  
배열의 각 원소에 적용할 콜백 함수를 인자로 받으며, 원소별로 반환 값을 처리하는 로직만 다름  
forEach() - 배열 전체 값을 순회하지만 콜백 함수의 반환 값은 무시  
every() - 배열 끝까지 또는 콜백 함수가 false를 반환할 때까지 순회  
some() - 특별한 반환 값은 일반적인 for 루프의 break 문처럼 끝까지 순회하기 전에 순회를 끝내는 데 쓰임  
for...in 루프를 이용한 객체 순회는 실제 열거 가능한 프로퍼티만 순회하고 그 값을 얻으려면 일일이 프로퍼티에 접근해야 하므로 간접적인 값 추출임  

배열 인덱스(또는 객체 프로퍼티)가 아닌 값을 직접 순회하는 방식 - ES6 배열 순회용 for...of 구문
```javascript
var myArray = [1, 2, 3];
for (var v of myArray) {
  console.log(v);
}
```
순회할 원소의 순회자 객체(@@iterator라는 기본 내부 함수)가 필요  
순회당 한 번씩 이 순회자 객체의 next() 메서드를 호출하여 연속적으로 반환 값을 순회함  
배열은 @@iterator가 내장된 덕분에 손쉽게 for...of 루프 사용 가능  

내장 @@iterator를 이용한 수동 배열 순회
```javascript
var myArray = [1, 2, 3];
var it = myArray[Symbol.iterator]();
it.next(); // {value:1, done:false}
it.next(); // {value:2, done:false}
it.next(); // {value:3, done:false}
it.next(); // {done:true}
```
ES6부터 Symbol.iterator 심볼로 객체 내부 프로퍼티인 @@iterator에 접근 가능  
이러한 특수 프로퍼티는 심볼에 포함될지 모를 특수값보다는 심볼명으로 참조하는 것이 좋음  
iterator는 순회자 객체가 아니라 순회자 객체를 반환하는 함수임  

순회자의 next()를 호출한 결과값은 {value:.., done:..}의 형태 - value는 현재 순회 값, done 다음에 순회할 값의 유무를 나타내는 불리언 값  
done:true가 되어 순회가 끝났다는 사실을 알기 전까지 next()를 한 번 더 호출  
일반 객체에는 내부에 @@iterator가 없음  

순회하려는 객체의 기본 @@iterator를 손수 정의하기
```javascript
var myObject = {
  a: 2,
  b: 3
};
Object.defineProperty(myObject, Symbol.iterator, {
  enumerable: false,
  writable: false,
  configurable: true,
  value: function() {
    var o = this;
    var idx = 0;
    var ks = Object.keys(o);
    return {
      next: function() {
        return {
          value: o[ks[idx]],
          done (idx > ks.length)
        };
      }
    };
  }
});

// myObject 수동 순회
var it = myObject[Symbol.iterator]();
it.next(); // {value: 2, done:false}
it.next(); // {value: 3, done:false}
it.next(); // {value: undefined, done:true}

// myObject for...of 루프 순회
for (var v of myObject) {
  console.log(v);
}
//2
//3
```
필요에 따라 사용자 자료 구조에 맞는 임의의 복잡산 순회 알고리즘 정의 가능  
ES6의 for...of 루프와 커스텀 순회자는 사용자 정의 객체를 조작하는 데 탁월한 구문 도구  
픽셀 객체 리스트 예 - (0, 0) 원점으로부터의 직선거리에 따라 순회 순서를 결정하거나 너무 멀리 떨어진 점은 걸러내는 등의 처리  
순회자가 next()를 호출했을 때 예산대로 {value:} 형태의 반환 값을 반환하고 순회가 끝나면 {done:true}를 반환한다는 전제하에 for...of로 순회 가능  

무한 순회자 - 순회가 끝나지 않고 항상 새로운 값을 반환
```javascript
var randoms = {
  [Symbol.iterator]: function() {
    return {
      next: function() {
        return { value: Math.random() };
      }
    };
  }
};
var random_pool = [];
for(var n of randoms) {
  random_pool.push(n);

  if (random_pool.length === 100) break;
  // 100개만 추출 - 무한 난수 추출에 의해 프로그램이 멈추는 상황 방지
}
```


# 4 클래스와 객체의 혼합
객체 지향 프로그래밍  
클래스 지향 - 자바스크립트 객체 체계와는 잘 맞지 않아 믹스인 등을 통한 기능 확장 시도가 있었음

## 4.1 클래스 이론
클래스와 상속 - 특정 형태의 코드와 구조를 형성하여 실생활 영역의 문제를 소프트웨어로 모델링하기 위한 방법  
객체 지향 또는 클래스 지향 프로그래밍에서 데이터는 자신을 기반으로 하는 실행되는 작동과 연관되므로 데이터와 작동을 함께 잘 감싸는 것(캡슐화)이 올바른 설계라고 강조함  

문자열의 경우, 문자열 데이터로 원하는 작업을 하는 것이 관심사이므로 데이터에 적용 가능한 작동들을 모두 String 클래스의 메서드로 설계함. 따라서 어떤 문자열이 주어지더라도 데이터와 작동이 잘 포장된 String 클래스의 인스턴스로 나타낼 수 있음  

클래스는 특정 자료 구조를 분류하는 용도로 사용됨  
일반적인 기준 정의에서 세부적이고 구체적인 변형으로서의 자료 구조를 도출하는 것  

탈 것과 차 예시  
Vehicle Class: Thing(추진 기관 등), Behaviro(사람 운송 기능 등) - 모든 유형의 탈것이 포함됨  
Car Class는 Vehicle에 있는 기반 정의를 상속(확장)받아 정의함 - Car는 일반적인 Vehicle의 정의를 세분화함  

인스턴스 데이터 - 차량별 고유 시리얼 넘버와 같은 것  
다형성 - 부모 클래스에 뭉뚱그려 정의된 작동을 자식 클래스에서 좀 더 구체화하여 오버라이드하는 것  
오버라이드된 작동에서 기반 작동을 참조할 수 있는 것은 상대적 다형성 덕분  

클래스 이론에서는 어떤 작동이 담긴 메서드의 이름을 부모와 자식 클래스 모두 똑같이 공유하여 자식 클래스 메서드가 부모 클래스 메서드를 오버라이드하라고 권장함  
그러나 자바스크립트에서느 예기치 않은 결과가 초래되며 불안정한 코드의 원인이 됨

### 4.1.1 클래스 디자인 패턴
절차적 프로그래밍 - 상위 수준의 추상화 없이 다른 함수를 호출하는 프로시저로만 코드를 구성하는 프로그래밍 기법  
클래스는 단지 많이 쓴느 서너 개 디자인 패턴 중 하나  
몇몇 언어는 클래스가 필수. C/C++, PHP 등의 언어는 절차적 구문과 클래스 지향 구문을 함께 제공

### 4.1.2 자바스크립트 클래스
new, instanceof, class 키워드(ES6 이후) 존재  
그러나 자바스크립트에는 클래스가 존재하지 않음  
클래스는 디자인 패턴이므로 고전적인 클래스 기능과 비슷하게 구현은 가능  
그러나 클래스처럼 보이는 구문일 뿐 클래스 디자인 패턴으로 코딩할 수 있도록 자바스크립트 체계를 억지로 고친 것에 불과  
자바스크립트의 클래스는 다른 언어의 클래스와 달리 모조품에 지나지 않음  
클래스는 소프터웨어 디자인 패턴 중 한 가지 옵션일 뿐 자바스크립트에서 클래스를 쓸지 말지는 사용자가 결정할 문제  

## 4.2 클래스 체계

### 4.2.1 건축
클래스와 인스턴스 중심 사고방식 - 건축 현장 비유  
아키텍트 - 건축의 모든 특성을 기획. 건물 내용물은 신경쓰지 않고, 부품들을 배치할 전체적인 구조만 기획  
아키텍처 청사진 - 건축을 위한 계획. 청사진만으로 사람이 생활하는 건물을 만들 수는 없음  
시공사 - 청사진에 따라 건물을 지음. 청사진을 작성한 아키텍트가 의도한 특성 그대로 물리적인 건물 복사  
완공된 건물은 청사진의 물리적인 인스턴스, 클래스는 청사진에 해당  

개발자가 상호 작용할 실제 객체는 클래스를 통해 인스턴스화 - 인스턴스 객체 생성  
개발자는 객체 메서드를 직접 호출하거나 공용(public) 데이터 프로퍼티에 접근  
객체는 클래스에 기술된 모든 특성을 그대로 가진 사본  
객체 인스턴스를 통해 클래스에 직접 접근하여 어떤 조작을 가할 일은 거의 없으나, 적어도 어느 클래스로부터 생성된 객체 인스턴스인지 출처 확인은 가능  

### 4.2.2 생성자
인스턴스는 보통 클래스명과 같은 이름의 생성자라는 특별한 메서드로 생성  
생성자는 인스턴스에 필요한 정보를 초기화함  
```
class CoolCuy {
  specialTrick = nothing

  CoolGuy(trick) {
    specialTrick = trick
  }

  showOff() {
    output("이게 내 장기랍니다: ", specialTrick)
  }
}
```
CoolCuy 인스턴스 생성을 위한 클래스 생성자 호출
```
Joe = new CoolGuy("카드 마술");
Joe.showOff() // 이게 내 장기랍니다: 카드 마술
```
CoolCuy 클래스에 생성자 CoolCuy() 존재 -> new CoolCuy()를 통해 생성자 호출  
생성자의 반환값은 객체(클래스 인스턴스) - showOff() 메서드를 호출하여 값 확인  
생성자는 클래스에 속한 메서드. 클래스명과 같게 명명하는 것이 일반적  
new 키워드를 통한 생성자 호출 - 새로운 클래스 인스턴스를 생성할 것이라는 신호를 엔진에 전달  

## 4.3 클래스 상속
클래스 지향 언어에서는 첫 번째 클래스를 상속받은 두 번째 클래스 정의 가능  
첫 번째 클래스는 '부모 클래스', 두 번째 클래스는 '자식 클래스'라 통칭  
자식 클래스는 부모 클래스에서 완전히 떨어진 별개의 클래스로 정의됨 - 부모로부터 복사된 초기 버전의 작동을 간직하지만 물려받은 작동을 새로운 방식으로 오버라이드 가능  
```
class Vehicle {
  engines = 1
  ignition() {
    output("엔진을 켠다.")
  }
  drive() {
    ignition()
    output("방향을 맞추고 앞으로 간다")
  }
}

class Car inherits Vehicle {
  wheels = 4
  drive() {
    inherited:drive()
    output(wheels, "개의 바퀴로 굴러간다")
  }
}

class SpeedBoat inherits Vehicle {
  engines = 2
  ignition() {
    output(engines, "개의 엔진을 켠다")
  }
  pilot() {
    ingerited:drive()
    output("물살을 가르며 쾌속으로 질주한다")
  }
}
```
Vehicle 클래스에는 추상적인 개념. Car와 Speedboat에서 각자에 맞는 특성 세분화

### 4.3.1 다형성
Car는 Vehicle로부터 상속받은 drive() 메서드를 같은 명칭의 자체 메서드로 오버라이드  
메서드 안에서 inherited:drive() 호출은 Vehicle로부터 상속받아 오버라이드하기 전의 원본을 참조하며 SpeedBoat의 pilot() 메서드도 상속받은 원본 drive())를 참조함 -> 다형성(가상 다형성)  
상대적 다형성 - 한 메서드가 상위 수준의 상속 체계에서 다른 메서드를 참조할 수 있게 해주는 아이디어  
'상대적' - 접근할 상속 수준(클래스)에 대한 절대적 기준이 없는 상태에서 한 수준 상위로 상대적으로 레퍼런스를 거슬러 올라가기 때문  
대부분 언어는 (inherited 대신) super 키워드 사용 - superclass를 현재 클래스의 부모/조상으로 간주하는 것  
같은 이름의 메서드가 상속 연쇄의 수준별로 다르게 구현되어 있고 이 중 어떤 메서드가 적절한 호출 대상인지 자동으로 선택하는 것이 다형성의 특징  
ignition() 메서드 - pilot() 안에서 상대-다형적 레퍼런스가 Vehicle에서 상속된 drive()를 참조하지만 drive()는 메서드 이름만 보고 ignition() 메서드를 참조함  

자바스크립트 엔진은 Vehicle과 SpeedBoat 중 SpeedBoat의 ignition()를 실행함 - 인스턴스가 어느 클래스를 참조하느냐에 따라 ignition() 메서드의 정의는 다형적  

super - 클래스를 상속 후 자신의 부모 클래스를 가리키기 위해 자식 클래스에 주어지는 상대적 래퍼런스  

### 4.3.2 다중 상속
일부 클래스 지향 언어에서는 복수의 부모 클래스에서 상속받을 수 있음  
다중 상속 - 부모 클래스 각각의 정의가 자식 클래스로 복사되는 것을 의미  
마름모 문제 - D 클래스가 부모 클래스 B, C로부터 상속받고 이 부모 클래스들은 다시 같은 부모 클래스 A를 같는 구조에서, A의 drive() 메서드를 B와 C가 각각 오버라이드한다면 D는 어느 메서드를 참조해야 하는가?  
자바스크립트는 다중 상속 기능을 지원하지 않음

## 4.4 믹스인
자바스크립트 객체는 상속받거나 인스턴스화해도 자동으로 복사 작업이 일어나지 않음 - 클래스 개념 자체가 없고 오직 객체만 존재  
객체는 다른 객체에 복사되는 것이 아니라 서로 연결됨  
민스인 - 클래스 복사 기능을 흉내낸 것. 명시적 믹스인과 암시적 믹스인

### 4.4.1 명시적 믹스인
자바스크립트 엔진은 Vehicle의 작동을 Car로 알아서 복사하지 않으므로 일일이 수동으로 복사하는 유틸리티를 대신 작성  
많은 자바스크립트 라이브러리와 프레임워크에서는 extend()라고 명명(예제에서는 mixin)
```javascript
function mixin(sourceObj, targetObj) {
  for(var key in sourceObj) {
    // 타깃에 없는 프로퍼티만 복사
    if(!(key in targetObj)) {
      targetObj[key] = sourceObj[key];
    }
  }
  return targetObj;
}

var Vehicle = {
  engines: 1,
  ignition: function() {
    console.log("엔진을 켠다.");
  },
  drive: function() {
    this.ignition();
    console.log("방향을 맞추고 앞으로 간다");
  }
};

var Car = mixin(Vehicle, {
  wheels: 4,
  drive: function() {
    Vehicle.drive.call(this);
    console.log(this.wheels + "개의 바퀴로 굴러간다");
  }
});
```
Car에는 Vehicle에서 복사한 프로퍼티와 함수 사본 존재 - 함수가 실제로 복사된 것은 아니고 원본 함수를 가리키는 레퍼런스만 복사된 것  
따라서 Car에는 ignition() 함수의 사본 레퍼런스인 ignition 프로퍼티와 Vehicle에서 복사한 1이란 값이 할당된 engine 프로퍼티가 존재  
Car에는 이미 자체 drive 프로퍼티가 있으므로 오버라이드되지 않음

#### 다형성 재고
Wehicle.drive.call(this)와 같은 코드는 명시적 의사다형성  
자바스크립트는 상대적 다형성을 제공하지 않음  
따라서 drive()라는 이름의 함수가 Vehicle과 Car 양쪽에 모두 있을 때 이 둘을 구별해서 호출하려면 절대적인 레퍼런스를 이용할 수 밖에 없음 - 명시적으로 객체의 이름을 지정하여 drive()를 호출  
Vehicle.drive()로 호출하면 this가 Car가 아닌 Vehicle 객체와 바인딩 -> .call(this)를 추가하여 drive()를 Car 객체 콘텍스트로 실행 강제  

상대적 다형성을 제공하는 클래스 지향 언어에서는 클래스가 정의되는 시점에 Vehicle과 Car가 연결되면 이러한 관계를 모두 한곳에서 취합하여 관리함  

명시적 의사다형성은 복잡하고 비용이 더 들기 때문에 권장하지 않음  

#### 사본 혼합
mixin()은 sourceObj 프로퍼티를 순회하면서 targetObj에 같은 이름의 프로퍼티 유무를 체크하여 없으면 복사함  
초기 객체가 이미 존재하므로 복사 시 타깃 프로퍼티를 덮어쓰지 않게 주의 필요  

체크 로직은 불필요 - 코드가 투박해지고 비효율적
```javascript
function mixin(sourceObj, targetObj) {
  for(var key in sourceObj) {
    if(!(key in targetObj)) {
      targetObj[key] = sourceObj[key];
    }
  }
  return targetObj;
}

var Vehicle = {
  //...
};

// Vehicle 내용을 넣을 빈 객체 생성
var Car = mixin(Vehicle, {});

// 원하는 내용을 Car에 복사
mixin(Vehicle, {
  wheels: 4,
  drive: function() {
    //...
  }
});
```
복사가 끝나면 Car는 Vehicle과 별개로 작동함 - Car에 프로퍼티를 추가해도 Vehicle엔 영향이 없고, 반대 역시 마찬가지  

공용 함수 레퍼런스는 두 객체 모두 같이 쓰기 때문에 수동으로 객체 간 함수를 일일이 복사하더라도 다른 클래스 지향 언어처럼 100%(클래스 -> 인스턴스) 복사는 어려움  
자바스크립트 함수는 복사 불가능 - 복사되는 것은 같은 공유 함수 객체를 가리키는 사본 레퍼런스  
공유 함수 객체에 프로퍼티 추가 등의 변경 시도 -> 공유 레퍼런스를 통해 Vehicle / Car 모두에 영향  

복수 객체를 타깃 객체에 믹스인할 경우 부분적으로 다중 상속을 모방할 수 있으나 여러 소스에서 같은 이름의 메서드, 프로퍼티 복사에 의한 충돌은 피하기 어려움  

명시적 믹스인은 코드 가독성에 도움이 되는 범위 내에서만 사용하고, 코드 추적이 어려워지거나 불필요한 객체 간 의존 관계가 양산될 가능성이 있다면 사용을 중단할 것을 권장

#### 기생 상속
명시적 믹스인 패턴의 변형. 명시적/암시적 특징을 모두 지님
```javascript
function Vehicle() {
  this.engines = 1;
}
Vehicle.prototype.ignition = function() {
  console.log("엔진을 켠다.");
}
Vehicle.prototype.drive = function() {
  this.ignition();
  console.log("방향을 맞추고 앞으로 간다.");
}

// 기생 클래스 Car
function Car() {
  var car = new Vehicle();

  //자동차에만 해당되는 내용 수정
  car.wheels = 4;

  //Vehicle::drive()를 가리키는 내부 레퍼런스 저장
  var vehDrive = car.drive;

  //Vehicle::drive() 오버라이드
  car.drive = function() {
    vehDrive.call(this);
    console.log(this.wheels + "개의 바퀴로 굴러간다.");
  }
  return car;
}
var myCar = new Car();

myCar.drive();
//엔진을 켠다.
//방향을 맞추고 앞으로 간다.
//4개의 바퀴로 굴러간다
```
초기에 부모 클래스인 Vehicle의 정의를 복사, 자식 클래스 정의에 믹스인 후 조합된 객체 car를 자식 인스턴스로 넘김

### 4.4.2 암시적 믹스인
명시적 의사다형성과 밀접한 관계 - 사용시 주의 필요
```javascript
var Something = {
  cool: function() {
    this.greeting = "Hello World";
    this.count = this.count ? this.count + 1 : 1;
  }
};
Something.cool();
Something.greeting; //Hello World
Something.count;

var Another = {
  cool: function() {
    // Something을 암시적으로 Another로 믹스인
    Something.cool.call(this);
  }
};

Another.cool();
Another.greeting; //Hello World
Another.count     // 1 (Something과 상태가 공유되지 않음)
```
가장 일반적인 생성자 호출 또는 메서드 호출 시 Something.cool.call(this)를 하면 Something.cool() 함수를 본질적으로 빌려와서 Another 콘텍스트로 호출함  
Something.cool()의 할당은 Something이 아닌 Another -> Something의 작동을 Another와 섞음  

this 재바인딩 활용 테크닉 - Something.cool.call(this) 같은 호출이 상대적 레퍼런스가 되지 않아 불안정 -> 사용이 권장되지 않음