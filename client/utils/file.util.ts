import SparkMD5 from 'spark-md5';

export function getFileMD5(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = function (event) {
            const spark = new SparkMD5.ArrayBuffer();
            const result = event.target?.result as ArrayBuffer;
            spark.append(result);
            const md5 = spark.end();
            resolve(md5);
        };

        fileReader.onerror = function (error) {
            reject(error);
        };

        fileReader.readAsArrayBuffer(file);
    });
}

export function getFileExt(filePath: string): string {
    return filePath.split('.').pop() || '';
}

export function downloadFileByBlob(fileBufferData: Blob[], fileName: string) {
    const blob = new Blob(fileBufferData);
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(downloadUrl);
}
