import standard from '../data/standard';
import weight from '../data/weight';
import AffixName from '../data/AffixName';
import {findCombinations,EnchanceAllCombinations} from '../data/combination';


onmessage = function (event) {
    //宣告變數
    let SubData=event.data.SubData;
    let partsIndex=parseInt(event.data.partsIndex);
    let MainAffix=AffixName.find((a)=>a.name===event.data.MainData);
    let deviation=(event.data.deviation!==undefined)?event.data.deviation:0;
    let limit = event.data.limit;
    let selfStand = event.data.standard;
    let enchanceCount = event.data.enchanceCount;

    //標準根據優先度升冪排列
    selfStand = selfStand.sort((a, b) => a.SelectPriority - b.SelectPriority);
    

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
            selectAffix.push(i);
        });
    }

    //計算可能的強化組合
    let combination=findCombinations(enchanceCount,SubData.length,selectAffix,limit);
    let charStandard=calStand(selfStand);
    //分數誤差 目前先預設少半個有效詞條

    let coeEfficent=[];//當前遺器係數arr
    SubData.forEach((sub)=>{
        let SubAffixType=AffixName.find((s)=>s.name===sub.subaffix);
        coeEfficent.push({
            type:SubAffixType.type,
            fieldName:SubAffixType.fieldName,
            num:Number(charStandard[SubAffixType.type])
        });
    });
    //將沒有被鎖住不可計算的詞條倒裝
    //coeEfficent.sort((a,b)=>)
    let MainData=charStandard[MainAffix.type];
    let result =[];
    let origin=relicScore(partsIndex,charStandard,SubData,MainData);
    //先算原本的遺器的分數
    //console.log(calPartWeights(charStandard,partsIndex))

    let p1=new Promise(async (resolve,reject)=>{
        combination.forEach((c,i)=>{
            //計算各種強化程度的組合
            let subcombination=EnchanceAllCombinations(c);

            subcombination.forEach((s)=>{
                let res=0;
                if(partsIndex!==1&&partsIndex!==2)
                    res=3*MainData;
                
                let total=0;
                let caltype=[];//已經計算過的詞條種類

                s.forEach((el,i) => {//對每個屬性詞條開始進行模擬計算
                    let sub=coeEfficent[i];
                    
                    let targetRange=AffixName.find((st)=>st.fieldName===sub.fieldName).range;

                    //如果該詞條所獲得的強化次數為0 可以推測該數值為初始詞條數值 則直接繼承使用
                    /*if(SubData[i].count===0)
                        total=SubData[i].data;
                    else
                        total=targetRange[1];//詞條模擬出來的總和，初始為最中間的值*/

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
                    
                });

                caltype.forEach((ms)=>{
                    if(ms.type!=='FIGHT_PROP_HP'&&ms.type!=='FIGHT_PROP_DEFENSE'&&ms.type!=='FIGHT_PROP_ATTACK')
                        res+=ms.affixmutl;
                });
                

                //理想分數
                let IdealyScore=Number((parseFloat(res/calPartWeights(charStandard,partsIndex))*100).toFixed(2));
                result.push(IdealyScore);
                
            });
        });

        resolve(origin);
    })

    p1.then((score)=>{
        //設立分數標準
        let scoreStand=[
            {rank:'S+',stand:85,color:'rgb(239, 68, 68)',tag:'S+'},
            {rank:'S',stand:70,color:'rgb(239, 68, 68)',tag:'S'},
            {rank:'A',stand:50,color:'rgb(234, 179, 8)',tag:'A'},
            {rank:'B',stand:35,color:'rgb(234, 88 , 12)',tag:'B'},
            {rank:'C',stand:15,color:'rgb(163, 230, 53)',tag:'C'},
            {rank:'D',stand:0 ,color:'rgb(22,163,74)',tag:'D'}
        ];
        let overScoreList=JSON.parse(JSON.stringify(result)).filter((num)=>num-deviation>Number(origin));
        let expRate=(overScoreList.length)/(result.length).toFixed(2);
        let copy=JSON.parse(JSON.stringify(result));
        let relicrank=undefined;
        let returnData=[]
        
        //根據標準去分類
        scoreStand.forEach((stand,i)=>{
            //區分符合區間跟不符合的 並一步步拿掉前面篩選過的區間
            let match=copy.filter((num)=>num>=stand.stand);
            copy=copy.filter((num)=>num<stand.stand);

            let standRate = Number((parseFloat(match.length/result.length)*100).toFixed(2));
            returnData.push({
                label:stand.tag,
                value:(!standRate)?0:standRate,
                color:stand.color,
                tag:stand.rank
            });


            //接著去找尋這個分數所屬的區間
            if(stand.stand<=origin&&relicrank===undefined){
                relicrank=stand;
            }
                
        });

        //如果該聖遺物計算出來所有區間均為0 則要給予分數所屬區間100%
        if(returnData.filter((r)=>r.value !==0).length===0){
            returnData.find((r)=>r.label === relicrank.rank).value =100;
        }


        /*
        //如果區間數量為0 則不予顯示*/
        this.postMessage({
            expRate:(!expRate)?0:expRate,//期望值
            relicscore:score,//遺器分數
            relicrank:relicrank,//遺器區間
            returnData:returnData//區間機率        
        })
        
    });
};

function relicScore(partsIndex,charStandard,SubData,MainData){
    let weight = 0
    var mutl=3*MainData;//直接默認強化至滿等
    let caltype=[];

    //如果是手跟頭則不套用主詞條加分
    if(partsIndex!==1&&partsIndex!==2){
        weight+=mutl;
    }
    SubData.forEach(a => {
        //去除%數
        var affix=parseFloat(a.data).toFixed(2);//實際數值
        let SubAffixType=AffixName.find((s)=>s.name===a.subaffix);
        //計算有效詞條數
        var affixStandard=standard.find((t)=>t.type==='sub').data.find((d)=>d.name===SubAffixType.fieldName).data;
        var cal=parseFloat(affix/affixStandard).toFixed(2);
        
        //獲得有效詞條
        let affixmutl=parseFloat(charStandard[SubAffixType.type]*cal);
       

        caltype.push({
            type:SubAffixType.fieldName,
            affixmutl:affixmutl,
        })
       
    });
    //計算這件遺器的最大有效詞條數

    //計算分數
    caltype.forEach((ms)=>{
        if(ms.type!=='FIGHT_PROP_HP'&&ms.type!=='FIGHT_PROP_DEFENSE'&&ms.type!=='FIGHT_PROP_ATTACK')
            weight+=ms.affixmutl;
    });

    let relicscore=0;

    //接下來根據部位調整分數
    //假設最大有效詞條數為10 實際只拿8個 代表你這件有80分以上的水準
    relicscore=parseFloat(weight/calPartWeights(charStandard,partsIndex))*100;
    return parseFloat(relicscore).toFixed(1);
    
}

//計算裝備權重
function calPartWeights(charstandard,partIndex){
    let partWeight = 5;//起始分數為5
    let mainkey='';
   
    //先將標準倒序
    charstandard=Object.entries(charstandard)
    .sort((a, b) => b[1] - a[1]);

    //主詞條 抓最大*3 剩下依序遞補 最多四個
    //花跟羽毛會跳過
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

//回傳資料
//1.遺器本身分數 2.期望值  