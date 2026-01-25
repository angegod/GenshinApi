import standard from '../data/standard';
import weight from '../data/weight';
import AffixName from '../data/AffixName';
import {findCombinations,EnchanceAllCombinations} from '../data/combination';
import { AffixItem, caltype, PieNums, RelicScoreStand, selfStand, SubData } from '@/data/RelicData';

onmessage = function (event) {
    //宣告變數
    let SubData:SubData=event.data.SubData;
    let partsIndex:number=parseInt(event.data.partsIndex);
    let MainAffix:AffixItem=AffixName.find((a)=>a.name===event.data.MainData)!;
    let deviation=(event.data.deviation!==undefined)?event.data.deviation:0;
    let limit:number = event.data.limit;
    let selfStand:selfStand = event.data.standard;
    let enchanceCount:number = event.data.enchanceCount;

    //標準根據優先度升冪排列
    selfStand = selfStand.sort((a, b) => {
        const aPriority = a.SelectPriority ?? 0;
        const bPriority = b.SelectPriority ?? 0;
        return aPriority - bPriority;
    });
    
    //計算可用強化次數 
    //透過詞條 優先度計算被選定的詞條
    let selectAffix:number[] = [];
    selfStand.filter((s) => s.SelectPriority != null && s.SelectPriority !== 0).forEach((s,i)=>{
        if(selectAffix.length<2){
            let targetSubdataIndex = SubData.findIndex((sb)=>sb.subaffix === s.name);
            if(targetSubdataIndex >=0)
                selectAffix.push(targetSubdataIndex);
        }
    });

    //進入simulator
    if(selectAffix.length === 0){
        SubData.filter((s) => s.isSelect).forEach((s)=>{
            selectAffix.push(s.index);
        });
    }

        // 如果選定的詞條仍不足 2 個，自動補齊
    if (selectAffix.length < 2) {
        for (let i = 0; i < SubData.length; i++) {
            if (!selectAffix.includes(i)) {
                selectAffix.push(SubData[i].index);
                if (selectAffix.length === 2) break;
            }
        }
        
    }

    //計算可能的強化組合
    let combination=findCombinations(enchanceCount,SubData.length,selectAffix,limit);
    let charStandard:any=calStand(selfStand);
    //分數誤差 目前先預設少半個有效詞條

    let coeEfficent:any=[];//當前遺器係數arr
    SubData.forEach((sub)=>{
        let SubAffixType:AffixItem=AffixName.find((s)=>s.name===sub.subaffix)!;
        coeEfficent.push({
            type:SubAffixType.type,
            fieldName:SubAffixType.fieldName,
            num:Number(charStandard[SubAffixType.type])
        });
    });

    //將沒有被鎖住不可計算的詞條倒裝
    let MainData=charStandard[MainAffix.type];
    let result:number[] = [];
    let origin=relicScore(partsIndex,charStandard,SubData,MainData);
    //先算原本的遺器的分數

    let p1=new Promise(async (resolve,reject)=>{
        combination.forEach((c,i)=>{
            //計算各種強化程度的組合
            let subcombination=EnchanceAllCombinations(c);

            subcombination.forEach((s)=>{
                let res=0;
                if(partsIndex!==1&&partsIndex!==2)
                    res=3*MainData;
                
                let total=0;
                let caltype:caltype[]=[];//已經計算過的詞條種類

                s.forEach((el:any,i:number) => {//對每個屬性詞條開始進行模擬計算
                    let sub=coeEfficent[i];
                    
                    let targetRange:number[]=AffixName.find((st)=>st.fieldName===sub.fieldName)!.range!;

                    //如果該詞條所獲得的強化次數為0 可以推測該數值為初始詞條數值 則直接繼承使用
                    /*if(SubData[i].count===0)
                        total=SubData[i].data;
                    else
                        total=targetRange[1];//詞條模擬出來的總和，初始為最中間的值*/

                    total=targetRange[1];//詞條模擬出來的總和，初始為最中間的值
                    
                    el.forEach((num:number)=>total+=targetRange[num]);

                    //計算有效詞條數
                    let affixStandard = standard.find((t) => t.type === 'sub')!
                        .data.find((d) => d.name === sub.fieldName)!
                        .data;

                    let cal=Number((total/affixStandard).toFixed(2));

                    //獲得加權有效詞條數 並加上去
                    let affixmutl = charStandard[sub.type] * cal;
                    
                    //如果沒有計算過此種類詞條
                    caltype.push({
                        type:sub.fieldName,
                        affixmutl:affixmutl
                    });    
                });

                caltype.forEach((ms:caltype)=>{
                    if(ms.type!=='FIGHT_PROP_HP'&&ms.type!=='FIGHT_PROP_DEFENSE'&&ms.type!=='FIGHT_PROP_ATTACK')
                        res+=ms.affixmutl;
                });
                
                //理想分數
                let IdealyScore = Number(((res/calPartWeights(charStandard,partsIndex)) * 100).toFixed(2));
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
        console.log(result);
        let overScoreList=JSON.parse(JSON.stringify(result)).filter((num:number)=>num-deviation>Number(origin));
        let expRate = Number((overScoreList.length / result.length));
        let copy=JSON.parse(JSON.stringify(result));
        let relicrank:RelicScoreStand|undefined=undefined;
        let returnData:PieNums=[]
        
        //根據標準去分類
        scoreStand.forEach((stand,i)=>{
            //區分符合區間跟不符合的 並一步步拿掉前面篩選過的區間
            let match=copy.filter((num:number)=>num>=stand.stand);
            copy=copy.filter((num:number)=>num<stand.stand);

            let standRate = Number(((match.length / result.length) * 100).toFixed(2));
            returnData.push({
                label:stand.tag,
                value:(!standRate)?0:standRate,
                color:stand.color,
                tag:stand.rank
            });

            //接著去找尋這個分數所屬的區間
            if(stand.stand<=Number(origin)&&relicrank===undefined){
                relicrank=stand;
            }
        });

        //如果該聖遺物計算出來所有區間均為0 則要給予分數所屬區間100%
        if(returnData.filter((r)=>r.value !==0).length===0){
            returnData.find((r)=>r.label === relicrank!.rank)!.value =100;
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

function relicScore(partsIndex:number,charStandard:any,SubData:SubData,MainData:number){
    let weight = 0
    var mutl=3*MainData;//直接默認強化至滿等
    let caltype:caltype[]=[];

    //如果是手跟頭則不套用主詞條加分
    if(partsIndex!==1&&partsIndex!==2){
        weight+=mutl;
    }
    SubData.forEach(a => {
        //去除%數
        var affix=Number(a.data.toFixed(2));//實際數值
        let SubAffixType=AffixName.find((s)=>s.name===a.subaffix)!;
        //計算有效詞條數
        var affixStandard=standard.find((t)=>t.type==='sub')!.data.find((d)=>d.name===SubAffixType.fieldName)!.data;
        var cal = Number((affix / affixStandard).toFixed(2));
        
        //獲得有效詞條
        let affixmutl = charStandard[SubAffixType.type] * cal;

        caltype.push({
            type:SubAffixType.fieldName,
            affixmutl:affixmutl,
        })
       
    });
    //計算這件遺器的最大有效詞條數

    //計算分數
    caltype.forEach((ms:caltype)=>{
        if(ms.type!=='FIGHT_PROP_HP'&&ms.type!=='FIGHT_PROP_DEFENSE'&&ms.type!=='FIGHT_PROP_ATTACK')
            weight+=ms.affixmutl;
    });

    let relicscore=0;

    //接下來根據部位調整分數
    //假設最大有效詞條數為10 實際只拿8個 代表你這件有80分以上的水準
    relicscore=weight/calPartWeights(charStandard,partsIndex)*100;
    return relicscore.toFixed(1);
}

//計算裝備權重
function calPartWeights(charstandard: Record<string, number>, partIndex: number): number {
    let partWeight = 5; // 四詞條有最高5次強化機會 所以才寫5
    let mainKey = '';

    // 將標準依照數值倒序排序
    const sortedStandard = Object.entries(charstandard).sort((a, b) => b[1] - a[1]);

    // 只有非花（1）與羽（2）才處理主詞條
    const { main, sub } = weight[partIndex];

    if (partIndex !== 1 && partIndex !== 2) {
        // 先找出：值不為 0、在主詞條中、且不在副詞條中的第一個 key
        const prioritized = sortedStandard.find(([key, value]) =>
            main.includes(key) && !sub.includes(key) && value !== 0
        );

        if (prioritized) {
            mainKey = prioritized[0];
            partWeight += prioritized[1] * 3;
        } else {
            // 否則只要在主詞條中即可（允許副詞條重複）
            const fallback = sortedStandard.find(([key]) => main.includes(key));
            if (fallback) {
                mainKey = fallback[0];
                partWeight += fallback[1] * 3;
            }
        }
    }

    // 副詞條：取最多 4 個不等於主詞條、存在於 sub 中的屬性
    let count = 0;
    for (const [key, value] of sortedStandard) {
        if (key !== mainKey && sub.includes(key)) {
            partWeight += value;
            count++;
            if (count === 4) break;
        }
    }

    return partWeight;
}

//製作標準
function calStand(stand:selfStand){
    //設立一個模板 根據使用者填入參數更改
    let model:Record<string,number>={
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
        let target=AffixName.find((a)=>a.name===s.name)!.type;
        model[target]=s.value;
    });

    return model;
}
