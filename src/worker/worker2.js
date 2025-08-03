import standard from '../data/standard';
import weight from '../data/weight.ts';
import AffixName from '../data/AffixName';
import {findCombinations,EnchanceAllCombinations} from '../data/combination';


//模擬計算在用的
onmessage = function (event) {
    //宣告變數
    let SubData=event.data.SubData;
    let partsIndex=parseInt(event.data.partsIndex);
    let MainAffix=AffixName.find((a)=>a.name===event.data.MainData);
    let limit = event.data.limit;
    let enchanceCount = event.data.enchanceCount;
    let selfStand = event.data.standard;


    //計算可用強化次數 
    //透過詞條 優先度計算被選定的詞條
    let selectAffix = [];
    selfStand.filter((s) => s.SelectPriority != null && s.SelectPriority !== 0).forEach((s,i)=>{
        if(selectAffix.length<2){
            let targetSubdataIndex = SubData.findIndex((sb)=>sb.subaffix === s.name);
            if(targetSubdataIndex >=0)
                selectAffix.push(targetSubdataIndex);
        }
    });

    //進入simulator
    if(selectAffix.length === 0){
        SubData.filter((s) => s.isSelect).forEach((s,i)=>{
            selectAffix.push(s.index);
        });
    }

    // 如果選定的詞條仍不足 2 個，自動補齊
    if (selectAffix.length < 2) {
        for (let i = 0; i < SubData.length; i++) {
            if (!selectAffix.includes(i)) {
                selectAffix.push(i);
                if (selectAffix.length === 2) break;
            }
        }
    }

    //計算可能的強化組合
    let combination=findCombinations(enchanceCount,SubData.length,selectAffix,limit);

    //根據強化組合的個數，隨機抽取一個(這個數值已經是索引值)
    let randomNum = Math.floor(Math.random() * combination.length);


    let charStandard=calStand(event.data.standard);
    //分數誤差 目前先預設少半個有效詞條

    let coeEfficent=[];//當前遺器係數arr
    SubData.forEach((sub)=>{
        let SubAffixType=AffixName.find((s)=>s.name===sub.subaffix);
        coeEfficent.push({
            type:SubAffixType.type,
            fieldName:SubAffixType.fieldName,
            num:Number(charStandard[SubAffixType.type]),
            locked:(sub.locked)?true:false
        });
    });

    let MainData=charStandard[MainAffix.type];
    let result = 0;
    //先算原本的遺器的分數

    let p1=new Promise(async (resolve,reject)=>{
        
        let randomCombination=combination[randomNum];

        //獲得所有可能的強化幅度組合
        let subcombination=EnchanceAllCombinations(randomCombination);

        //獲取隨機一種強化幅度的組合
        let randomNum2 =Math.floor(Math.random() * subcombination.length);

        let ran_subcombination=subcombination[randomNum2];

        let res=0;
        if(partsIndex!==1&&partsIndex!==2)
            res=3*MainData;
        
        
        let caltype=[];//已經計算過的詞條種類

        let newSubaffix=[];

        ran_subcombination.forEach((el,i) => {//對每個屬性詞條開始進行模擬計算
            let total=0;
            let sub=coeEfficent[i];
            
            let targetRange=AffixName.find((st)=>st.fieldName===sub.fieldName).range;

            //如果該詞條所獲得的強化次數為0 可以推測該數值為初始詞條數值 則直接繼承使用
            if(SubData[i].count===0)
                total=SubData[i].data;
            else
                total=targetRange[1];//詞條模擬出來的總和，初始為最中間的值
            
            el.forEach((num)=>total+=targetRange[num]);

            //計算有效詞條數
            let affixStandard=standard.find((t)=>t.type==='sub').data.find((d)=>d.name===sub.fieldName).data;
            let cal=parseFloat(total/affixStandard).toFixed(2);

            //獲得加權有效詞條數 並加上去
            let affixmutl=parseFloat(charStandard[sub.type]*cal);
            
            
            //如果沒有計算過此種類詞條
            caltype.push({
                type:sub.fieldName,
                affixmutl:affixmutl
            });
            
            newSubaffix.push({
                index:newSubaffix.length,
                subaffix:SubData[i].subaffix,
                data:parseFloat(total.toFixed(1)),
                count:randomCombination[i]
            });
            
        });

        caltype.forEach((ms)=>{
            if(ms.type!=='FIGHT_PROP_HP'&&ms.type!=='FIGHT_PROP_DEFENSE'&&ms.type!=='FIGHT_PROP_ATTACK')
                res+=ms.affixmutl;
        });
        

        //理想分數
        let IdealyScore=Number((parseFloat(res/calPartWeights(charStandard,partsIndex))*100).toFixed(2));
        result=IdealyScore;

        resolve(newSubaffix);
    })

    p1.then((newSubaffix)=>{
        //設立分數標準
        let scoreStand=[
            {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
            {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
            {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
            {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
            {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
            {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
        ];
        //標準排序顛倒
        scoreStand.reverse();
       
        
        let relicrank=undefined;
        let match = true;
        
        //console.log(result);
        //根據標準去分類
        scoreStand.forEach((stand,i)=>{

            //如果當前的分數超過目前的標準 則繼續往下找
            if(result<stand.stand&&match&&i!==0){
                match = false;
                relicrank =scoreStand[i-1];
            }

            //如果目前分數超過最終標準
            if(i===scoreStand.length-1&&match){
                match = false ;
                relicrank=scoreStand[i];
            }
           


            //接著去找尋這個分數所屬的區間
            if(stand.stand<=origin&&relicrank===undefined)
                relicrank=stand;

        });
        this.postMessage({
            relicscore:Number(result.toFixed(1)),//遺器分數
            relicrank:relicrank,//遺器區間
            returnData:newSubaffix //該次模擬強化後各項數據
        })
        
    });
};

//計算裝備權重
function calPartWeights(charstandard,partIndex){
    let partWeight = 5;//起始分數為5
    let mainkey='';
   
    //先將標準倒序
    charstandard=Object.entries(charstandard)
    .sort((a, b) => b[1] - a[1]);

    //主詞條 抓最大*3 剩下依序遞補 最多四個
    //頭跟手會跳過
    if(partIndex!==1&&partIndex!==2){

        charstandard.forEach(([key,value])=>{
            let unique=!weight[partIndex].sub.includes(key);
            //要優先計算只出現在主詞條的
            if(weight[partIndex].main.includes(key)&&mainkey===''&&unique&&value!==0){
                mainkey=key;
                partWeight=partWeight+value*3;
            }
        });

        if(mainkey===''){
            charstandard.forEach(([key,value])=>{
                if(weight[partIndex].main.includes(key)&&mainkey===''){
                    mainkey=key;
                    partWeight=partWeight+value*3;
                }
            });
        }
    }
    
    //計算副詞條最大權重 最多計入四個
    let calcount=0
    charstandard.forEach(([key,value])=>{
        if(key!==mainkey && calcount<4 && weight[partIndex].sub.includes(key)){
            partWeight=partWeight+value;
            calcount+=1;
        }
    });
    return partWeight;
}

//製作標準
function calStand(stand){

    //設立一個模板 根據使用者填入參數更改
    let model={
        hp: 0,
        atk: 0,
        def: 0,
        crit_rate: 0,
        crit_dmg: 0,
        elem:0,
        charge:0,
        fire_dmg:0,
        ice_dmg:0,
        water_dmg:0,
        elec_dmg:0,
        rock_dmg:0,
        wind_dmg:0,
        grass_dmg:0,
        phy_dmg:0,
        heal_rate:0
    };

    //根據有效詞條關鍵字
    stand.forEach((s)=>{
        let target=AffixName.find((a)=>a.name===s.name).type;
        model[target]=parseFloat(s.value);
    });

    return model;
}

//計算將會移置後台worker運作

//所需資料
//2.遺器本身數據(SubData) 3.遺器部位
