let dataBuffer = "";
process.stdin.on("data", (data) => {
  dataBuffer += data.toString();
});
process.stdin.on("close", () => {
  processData(dataBuffer.toString());
});
const processData = (data) => {
  const reportStats = {};
  data.split("\n").map((reportLine) => {
    if (reportLine !== "") {
      const readStats = processReportLine(reportLine);
      const accNumbers = readStats["subjectId"].split("|");
      const accno = accNumbers[accNumbers.length - 2];
      const accnoNoVersion = accno.split(".")[0];
      if (
        readStats["alignmentLength"] >= 150 &&
        readStats["percentIdentity"] >= 100 &&
        readStats["evalue"] > "1e-50"
      )
        if (reportStats[accnoNoVersion]) {
          const { subjectId, ...rest } = readStats;
          reportStats[accnoNoVersion].push(rest);
        } else {
          const { subjectId, ...rest } = readStats;
          reportStats[accnoNoVersion] = [];
          reportStats[accnoNoVersion].push(rest);
        }
    }
  });
  mergeStats(reportStats);
};
const processReportLine = (line) => {
  const columns = line.split("\t");
  return lineReportObjectFactory(...columns);
};
const lineReportObjectFactory = (
  readId,
  subjectId,
  subjectTitle,
  percentIdentity,
  startAlignment,
  endAlignment,
  alignmentLength,
  evalue,
  bitscore
) => {
  return {
    readId,
    subjectId,
    subjectTitle,
    percentIdentity,
    startAlignment,
    endAlignment,
    alignmentLength,
    evalue,
    bitscore,
  };
};
const mergeStats = async (reportJson) => {
  Object.keys(reportJson).map(async (accno) => {
    if (reportJson[accno].length >= 20) {
      const mergedObjects = await mergeReads(reportJson[accno]);
      console.log({
        accno,
        ...mergedObjects,
        noreads: reportJson[accno].length,
      });
    }
  });
};
const mergeReads = (readObjects) => {
  const interval = {};
  percentIdentityAvg = 0;
  bitscoreAvg = 0;
  evalueAvg = 0;
  totalLength = 0;
  subjectTitle = "";
  readObjects.map((item, index) => {
    if (index === 0) {
      interval.start = Number(item.startAlignment);
      interval.end = Number(item.endAlignment);
      bitscoreAvg = Number(item.bitscore);
      evalueAvg = Number(item.evalue);
      totalLength = Number(item.alignmentLength);
      subjectTitle = item.subjectTitle;
    } else {
      if (Number(item.startAlignment) < interval.start) {
        totalLength += interval.start - Number(item.startAlignment);
        interval.start = Number(item.startAlignment);
      }
      if (Number(item.endAlignment) > interval.end) {
        totalLength += Number(item.endAlignment) - interval.end;
        interval.end = Number(item.endAlignment);
      }
      percentIdentityAvg += parseInt(item.percentIdentity);
      bitscoreAvg += Number(item.bitscore);
      evalueAvg += Number(item.evalue);
    }
  });
  percentIdentityAvg = percentIdentityAvg / readObjects.length;
  bitscoreAvg = bitscoreAvg / readObjects.length;
  evalueAvg = evalueAvg / readObjects.length;
  return {
    subjectTitle,
    percentIdentity: percentIdentityAvg,
    startAlignment: interval.start,
    endAlignment: interval.end,
    evalue: evalueAvg,
    bitscore: bitscoreAvg,
    alignmentLength: totalLength,
  };
};
