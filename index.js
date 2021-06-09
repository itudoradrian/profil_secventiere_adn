const { spawn } = require("child_process");
const fs = require("fs");

const sampleFileName =
  "/home/tudor/Downloads/NPHL166134_R1.cluster_toy.fastq.gz";
const zcatProcess = spawn("zcat", [`${sampleFileName}`]);
const cutAdaptProcess = spawn(
  "fastp",
  [
    "--stdin",
    "--stdout",
    "--adapter_fasta=/home/tudor/Downloads/adapters.fasta",
  ],
  { shell: true }
);
const bowtie2Process = spawn(
  "bowtie2",
  [
    "-p 4",
    "-x /home/tudor/Downloads/GCA_000001405.15_GRCh38_full_analysis_set.fna.bowtie_index/GCA_000001405.15_GRCh38_full_analysis_set.fna.bowtie_index",
    "--very-fast",
    "-U",
    "-",
  ],
  { shell: true }
);
const samtoolsProcess = spawn("samtools", ["fasta", "-"], { shell: true });
const blastProcess = spawn(
  "blastn",
  [
    '-outfmt "6 qseqid sacc stitle pident sstart send length evalue bitscore"',
    "-evalue 1e-20",
    "-db /home/tudor/licenta/nt_virus.fasta",
  ],
  { shell: true }
);
const processBlastProcess = spawn("node", ["process_blast_report.js"], {
  shell: true,
});

zcatProcess.stdout.pipe(cutAdaptProcess.stdin);
zcatProcess.stderr.pipe(fs.createWriteStream("err.out"));
// cutAdaptProcess.stdin.pipe(process.stdin);
cutAdaptProcess.stdout.pipe(bowtie2Process.stdin);
cutAdaptProcess.stderr.pipe(fs.createWriteStream("err.out"));
bowtie2Process.stdout.pipe(samtoolsProcess.stdin);
bowtie2Process.stderr.pipe(fs.createWriteStream("err.out"));
samtoolsProcess.stdout.pipe(blastProcess.stdin);
samtoolsProcess.stderr.pipe(fs.createWriteStream("err.out"));
blastProcess.stdout.pipe(processBlastProcess.stdin);
blastProcess.stderr.pipe(fs.createWriteStream("err.out"));
processBlastProcess.stdout.pipe(process.stdout);
// fs.createWriteStream("output.txt", { encoding: "utf-8" })
processBlastProcess.stderr.pipe(fs.createWriteStream("err.out"));
