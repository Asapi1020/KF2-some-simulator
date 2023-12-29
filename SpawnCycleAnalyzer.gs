function rand(max)
{
  return Math.floor(Math.random() * max);
}

function getWaveSize(config)
{
  let gamelen = config[0];
  let difficulty = config[1];
  let waveNum = config[2];
  let playerCount = config[3];
  let multiplier, baseNum, difficultyMod;
  const defaultMultiplier = [1.0, 2.0, 2.75, 3.5, 4.0, 4.5];
  const defaultBaseNum = [ [25, 32, 35, 42], [25, 28, 32, 32, 35, 40, 42], [25, 28, 32, 32, 35, 35, 35, 40, 42, 42] ];
  const defaultDifficultyMod = [0.85, 1.0, 1.3, 1.7];

  if(playerCount <= 6 && playerCount > 0)
  {
    multiplier = defaultMultiplier[playerCount-1];
  }
  else
  {
    multiplier = defaultMultiplier[5] + (playerCount-6)*0.211718;
  }

  baseNum = defaultBaseNum[gamelen][waveNum-1];
  difficultyMod = defaultDifficultyMod[difficulty];
  return Math.round(multiplier * baseNum * difficultyMod);
}

function getMatchSize(config)
{
  let i
  let size=0;

  for(i=1; i<=Number(config[0])*3+4; i++)
  {
    config[2] = i;
    size += getWaveSize(config);
  }
  return size;
}

function getSquad(squad)
{
  let aiSquad = squad.split("_");
  let strAISquad = [];
  let i;

  for(i=0; i<aiSquad.length; i++)
  {
    strAISquad.push(aiSquad[i].split("-"));
  }

  return strAISquad;
}

function countZed(squadList)
{
  let i;
  let count = 0;
  for(i=0; i<squadList.length; i++)
  {
    count += Number(squadList[i][0]);
  }

  return count;
}

function countSquadsSize(squads)
{
  let i;
  let count = 0;
  let squad;

  for(i=0; i<squads.length; i++)
  {
    squad = getSquad(squads[i]);
    count += countZed(squad);
  }

  return count;
}

function tryRepl(zed, difficulty)
{
  zed = zed.toUpperCase();
  let fRand = Math.random();
  const alChance = [0.0, 0.0, 0.25, 0.35];
  const crChance = [0.0, 0.01, 0.15, 0.2];
  const gfChance = [0.1, 0.25, 0.35, 0.45];
  const roboChance = [0.08, 0.1, 0.15, 0.21];
  const rageChance = [0.0, 0.0, 0.2, 0.33];

  if((zed == "AL" && fRand < alChance[difficulty]) ||
     (zed == "CR" && fRand < crChance[difficulty]) ||
     (zed == "GF" && fRand < gfChance[difficulty]))
  {
    return zed + "*";
  }
  else if(((zed == "HU" || zed == "ST") && fRand < roboChance[difficulty]))
  {
    switch(rand(3))
    {
      case 0: return "DE";
      case 1: return "DR";
      case 2: return "DL";
      default: return zed + "*";
    }
  }
  else if((zed == "FP" || zed == "QP") && fRand < rageChance[difficulty])
  {
    return zed + "!";
  }
  return zed;
}

function compileSquad(squadList, difficulty)
{
  let elementalSquad = [];
  let shuffledSquad = [];
  let i, j;

  // extract
  for(i=0; i<squadList.length; i++)
  {
    for(j=0; j<Number(squadList[i][0]); j++)
    {
      elementalSquad.push(squadList[i][1]);
    }
  }
  
  // shuffle
  while(elementalSquad.length > 0)
  {
    i = rand(elementalSquad.length);
    // elite or ragespawn
    shuffledSquad.push(tryRepl(elementalSquad[i], difficulty));
    elementalSquad.splice(i, 1);
  }

  // group
  j = 1; // group size
  for(i=shuffledSquad.length-1; i>=0; i--)
  {
    if(i != 0 && shuffledSquad[i] == shuffledSquad[i-1])
    {
      ++j;
    }
    else
    {
      shuffledSquad[i] = [j, shuffledSquad[i]];
      if(j>1)
      {
        shuffledSquad.splice(i+1, j-1);
        j = 1;
      }
    }
  }

  return shuffledSquad;
}

function adjustLen(squad, len)
{
  let i;
  let count = 0;
  let result = [];

  for(i=0; i<squad.length; i++)
  {
    count += squad[i][0];
    result.push(squad[i]);
    if(count > len)
    {
      result[i][0] -= (count - len);
      break;
    }
  }
  return result;
}

function getCycle(normalSquads, specialSquads, gamelen, difficulty, waveNum, playerCount)
{
  let waveSize = getWaveSize([gamelen, difficulty, waveNum, playerCount]);
  let bForceSpecial = false;
  let numCycles = 1;
  let totalCount = 0;
  let bNeedSpecial = false;
  let availableSquads = []
  let tempSquads = []; // 1D List
  let newSquad, specialSquad; // 2D List
  let squads = []; // 3D List
  let randNum, leftSize, squadSize; // int
  
  do
  {
    if(availableSquads.length == 0)
    {
      bNeedSpecial = numCycles == 1 || (difficulty == 2 || difficulty == 3) && numCycles % 2 == 1;
      numCycles++;
      availableSquads = normalSquads.split(",");    
      if(bNeedSpecial)
      {
        tempSquads = specialSquads.split(",");
        randNum = rand(tempSquads.length);
        availableSquads.push(tempSquads[randNum]);
        squadsSize = countSquadsSize(availableSquads);

        if(squadsSize > waveSize)
        {
          bForceSpecial = true;
        }
      }
    }

    randNum = rand(availableSquads.length);
    if(bForceSpecial || randNum == availableSquads.length-1)
    {
      bForceSpecial = false;
    }
    newSquad = getSquad(availableSquads[randNum]);

    if(bForceSpecial)
    {
      specialSquad = getSquad(availbleSquads[availbleSquads.length-1]);
      if(totalCount + countZed(newSquad) + countZed(specialSquad) > waveSize)
      {
        newSquad = specialSquad;
        randNum = availbleSquads.length-1;
        bForceSpecial = false;
      }
    }

    availableSquads.splice(randNum, 1);
    leftSize = waveSize - totalCount;
    squadSize = countZed(newSquad);
    newSquad = compileSquad(newSquad, difficulty);
    if(leftSize < squadSize)
    {
      newSquad = adjustLen(newSquad, leftSize);
    }

    squads.push(newSquad);
    totalCount += squadSize;
  }while(totalCount < waveSize);

  return squads;
}

function getCyclePart(normalSquads, specialSquads, gamelen, difficulty, waveNum, playerCount, index)
{
  let cycle = getCycle(normalSquads, specialSquads, gamelen, difficulty, waveNum, playerCount);
  return cycle[index][0][1];
}

function analyzeCycle(squadInfo, config, nullbool)
{
  let gamelen = config[0];
  let difficulty = config[1];
  let waveNum = config[2];
  let playerCount = config[3];
  let normal = squadInfo[0][0];
  let special = squadInfo[1][0];
  let cycle = getCycle(normal, special, gamelen, difficulty, waveNum, playerCount);
  let i, j, index;
  let count = [];
  let zed;
  const zeds = ["CY","AL","SL","AL*","GF","GF*","CR","CR*","ST","BL","HU","SI","DE","DR","DL","SC","QP","FP", "QP!", "FP!"];

  for(i=0; i<zeds.length; i++)
  {
    count.push(0);
  }

  for(i=0; i<cycle.length; i++)
  {
    for(j=0; j<cycle[i].length; j++)
    {
      zed = cycle[i][j][1];
      index = zeds.indexOf(zed);
      if(index != -1)
      {
        count[index] += Number(cycle[i][j][0]);
      }
    }
  }
  return count;
}

function analyzeEntireCycle(squadInfos, config, nullbool)
{
  let count
  let result = [];
  let w, i;
  let squadInfo;

  for(w=1; w<=config[0]*3+4; w++)
  {
    config[2] = w;
    squadInfo = [[squadInfos[0][w-1]],[squadInfos[1][w-1]]];
    count = analyzeCycle(squadInfo, config, nullbool);

    if(result.length == 0)
    {
      result = count;
    }
    else
    {
      for(i=0; i<count.length; i++)
      {
        result[i] += count[i];
      }
    }    
  }

  return result;
}

function getCycleDef(normalSquads, specialSquads, gamelen, difficulty, waveNum, pleyerCount, nullbool)
{
  let cycle = getCycle(normalSquads, specialSquads, gamelen, difficulty, waveNum, pleyerCount);
  let squads = [];
  let squadDefs = [];
  let i, j;
  
  for(i=0; i<cycle.length; i++)
  {
    for(j=0; j<cycle[i].length; j++)
    {
      squads.push(cycle[i][j].join(""));
    }
    squadDefs.push(squads.join("_"));
  }
  return squadDefs.join(",");
}

function getSquadDef(squadInfo)
{
  let tempstr = squadInfo[0];
  squadInfo[0] = squadInfo[0][0].replace(/-/g, "");
  squadInfo[1] = squadInfo[1][0].replace(/-/g, "");
  return squadInfo;
}

function unpackSquadInfo(squadInfo)
{
  let squads = squadInfo.split("Elements=");
  squads.shift();

  let elements, elem;
  let i, j;

  for(i=0; i<squads.length; i++)
  {
    elements = squads[i].split("Num=");
    elements.shift();
    
    for(j=0; j<elements.length; j++)
    {
      elem = elements[j].split(",Code=\"");
      elements[j] = elem[0] + "-" + elem[1].split("\"")[0];
    }
    squads[i] = elements.join("_");
  }

  return squads.join(",");
}

function unpackCycleInfo(info, waveNum)
{
  let waveInfo = info.split("NormalSquads=");
  waveInfo.shift();

  let squadInfo = waveInfo[waveNum-1].split("SpecialSquads="); // 0: Normal, 1: Special

  squadInfo[0] = unpackSquadInfo(squadInfo[0]);
  squadInfo[1] = unpackSquadInfo(squadInfo[1]);
  return squadInfo;
}

function unpackMatchInfo(info, gamelen)
{
  let w;
  let result = [[],[]];
  let temp;

  for(w=1; w<=gamelen*3+4; w++)
  {
    temp = unpackCycleInfo(info,w);
    result[0].push(temp[0])
    result[1].push(temp[1])
  }

  return result;
}

function testF(list)
{
  return list;
}