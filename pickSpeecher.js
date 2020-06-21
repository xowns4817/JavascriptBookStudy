
// 발표에 걸리는 사람은 횟수가 가장 작은 사람들에서 선택됨 (즉, 내가 이번주에 걸렸으면 한바퀴 돌때까지 안걸림) 
// -> 모두 0번에서 시작하면 그렇고 현재는 숫자가 다르므로 3번걸린 강수님은 다른사람 모두가 3번채울때까지 안걸림
// 1, 0, 0, 1, 3, 0 이라면 -> 0,0,0 들만 발표하는 사람 리스트에 포함 ( 김태준, 조성동, 안민원 )
let speechCount = { // 걸린 횟수
    김아라: 1,
    김태준: 0,
    조성동: 0,
    하현관: 1,
    김강수: 3,
    안민원: 0,
};

let speecherList = [ ]; // 발표자 후보 이름 리스트

let minCount = Infinity;

// 가장 안걸린 사람 횟수 구하기
function findMinCount() {
    Object.keys(speechCount).forEach(function (key) {
        let cnt = speechCount[key];
        if (cnt <= minCount) minCount = cnt;
    });
};

// 발표할 사람 리스트 구하기
function findSpeecherList( ) {
    
    Object.keys(speechCount).forEach(function (key) {
        let cnt = speechCount[key];
        if (cnt === minCount) speecherList.push(key);
    });
};

// 발표할 사람 리스트 중 1명 선택
// Math.random().toFixed(1)*10 -> 0 ~ 9사이의 수
// speecherList.size()로 나눈 나머지로 랜던하게 한명 선택
function pickSpeecher( ) {
    let randomNumber = Math.random().toFixed(1)*10;
    let speecherIdx = (randomNumber % speecherList.length);
    console.log(`축하합니다. 이번주 발표자는 : ${speecherList[speecherIdx]}님 입니다. !`);
};

findMinCount();
findSpeecherList();
pickSpeecher( );
