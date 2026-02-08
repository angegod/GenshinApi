import { SubDataItem, SubSimulateDataItem } from "./RelicData";
import AffixName, { AffixItem } from "./AffixName";

// 強化詞條種類組合（含共享保底條件）
export function findCombinations(sum:number, length:number, selectedIndexes:number[] = [], minShared:number = 0):number[][] {
  //console.log(sum,length,selectedIndexes,minShared);
  
  const result:number[][] = [];

  function generateCombination(arr:number[], currentSum:number) {
      if (arr.length === length) {
          if (currentSum === sum) {
              // ✅ 額外條件：指定的 index 們的加總必須 ≥ minShared
              const selectedSum = selectedIndexes.reduce((acc, idx) => acc + arr[idx], 0);
              if (selectedSum >= minShared) {
                result.push([...arr]);
              }
          }
        return;
      }

      // 確保剩下位置可以填滿剩下的 sum
      for (let i = 0; i <= sum - currentSum; i++) {
          arr.push(i);
          generateCombination(arr, currentSum + i);
          arr.pop();
      }
  }

  generateCombination([], 0);
  return result;
}

//console.log(findCombinations(5,4,[2,3],4));

//強化詞條數據種類
export  function EnchanceAllCombinations(enhanceCounts:number[]) {
    const results:number[][][] = [];
    const values = [0, 1, 2 ,3]; // 強化程度可能的值 原神版本

    function backtrack(index:number, currentCombination:number[][]) {
      // 如果所有詞條都已處理完成，保存結果
      if (index === enhanceCounts.length) {
          results.push([...currentCombination]);
          return;
      }

      // 根據當前詞條的強化次數，生成所有可能的強化組合
      const enhanceCount = enhanceCounts[index];
      const possibleCombinations: number[][] = [];


      // 遍歷當前詞條的所有可能組合
      function generateEnhanceValues(temp:number[]) {
          if (temp.length === enhanceCount) {
            possibleCombinations.push([...temp]);
            return;
          }
          for (const value of values) {
            temp.push(value);
            generateEnhanceValues(temp);
            temp.pop();
          }
      }

      generateEnhanceValues([]);

      // 對於當前詞條的每一種可能組合，繼續處理下一個詞條
      for (const combination of possibleCombinations) {
          currentCombination.push(combination);
          backtrack(index + 1, currentCombination);
          currentCombination.pop();
      }
    }

    backtrack(0, []);
    return results;
}


export function findSubDataInitVal(SubData: SubDataItem | SubSimulateDataItem) {
    let targetAffix = AffixName.find((a) => a.name === SubData.subaffix) as AffixItem;

    if (!targetAffix || !targetAffix.range) return 0;

    // 1. 強化次數為 0
    //if (SubData.count === 0) {
    //    return SubData.data;
    //}

    const range = targetAffix.range;
    const EPSILON = 0.05;

    // 2. 沒有強化過的數值判斷(強化次數為0的)
    const minVal = range[0];
    const maxVal = range[range.length - 1];

    const target = Number(SubData.data.toFixed(1));
    
    const noEnchantNum = range.find(r =>
        Math.floor(r * 10) / 10 === target
    );

    if(noEnchantNum!==null && noEnchantNum!==undefined){
        console.log(`${SubData.subaffix}該詞條沒有被強化過，直接回傳初始值${noEnchantNum}`);
        return noEnchantNum;
    }

    // 3.排列組合

    //可能的強化次數

    const minCount = Math.ceil(SubData.data / maxVal); // 無條件進位 → 至少要幾次
    const maxCount = Math.floor(SubData.data / minVal); // 無條件捨去 → 至多幾次

    let enchanceArr = [];
    for(var i=1;i<=6;i++){
        if(i >= minCount && i<= maxCount){
            enchanceArr.push(i);
        }
    }

    //獲得所有可能的強化幅度組合
    let enchantCombinations = generateEnhanceCombinations(enchanceArr);


    //針對所有組合 計算總和數值 最後再去跟原本的數值 (SubData.data)
    // 篩選符合 SubData.data 的組合
    enchantCombinations = enchantCombinations.filter(arr => {
        const calData = arr.reduce((sum, idx) => sum + range[idx], 0);
        return Number(calData.toFixed(1)) === Number(SubData.data.toFixed(1));
    });

    console.log(`${SubData.subaffix}剩餘可能組合:`,enchantCombinations);
}

/**
 * 將多個強化次數生成的幅度組合整合到一個陣列
 * @param enhanceCounts 強化次數陣列，例如 [3,4]
 * @param maxValue 單次強化最大值（預設 3 → 對應 0~3）
 * @returns 整合後的所有組合
 */
export function generateEnhanceCombinations(enhanceCounts: number[],maxValue = 3): number[][] {
    const results: number[][] = [];

    function dfs(path: number[], depth: number, count: number) {
        if (depth === count) {
        results.push([...path]);
            return;
        }

        for (let i = 0; i <= maxValue; i++) {
            path.push(i);
            dfs(path, depth + 1, count);
            path.pop();
        }
    }

    for (const count of enhanceCounts) {
        dfs([], 0, count);
    }

    return results;
}


