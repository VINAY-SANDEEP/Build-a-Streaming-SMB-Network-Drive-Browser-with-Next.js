import SMB2 from '@marsaud/smb2';

let smbClient: any = null;

export const getSMBClient = () => {
  if (smbClient) return smbClient;

  smbClient = new SMB2({
    share: `\\\\${process.env.SMB_HOST || 'localhost'}\\${process.env.SMB_SHARE || 'share'}`,
    domain: process.env.SMB_DOMAIN || 'WORKGROUP',
    username: process.env.SMB_USERNAME || '',
    password: process.env.SMB_PASSWORD || '',
    port: parseInt(process.env.SMB_PORT || '445', 10),
    autoCloseTimeout: 0,
  });

  return smbClient;
};

export const listDirectory = (path: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    try {
      const smb = getSMBClient();
      smb.readdir(path, (err: any, files: any[]) => {
        if (err) return reject(err);

        const filePromises = files.map((fileName) => {
          return new Promise<any>((res, rej) => {
            if (fileName === '.' || fileName === '..') {
              res(null);
              return;
            }
            const fullPath = path === '' ? fileName : `${path}\\${fileName}`;
            smb.stat(fullPath, (statErr: any, stats: any) => {
              if (statErr) return rej(statErr);
              res({
                name: fileName,
                type: stats.isDirectory() ? 'directory' : 'file',
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
                path: fullPath.replace(/\\/g, '/'),
              });
            });
          });
        });

        Promise.all(filePromises)
          .then((results) => resolve(results.filter(Boolean)))
          .catch(reject);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const readFileStream = (path: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const smb = getSMBClient();
      smb.createReadStream(path, (err: any, readStream: any) => {
        if (err) return reject(err);
        resolve(readStream);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const writeFileStream = (path: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const smb = getSMBClient();
      smb.createWriteStream(path, (err: any, writeStream: any) => {
        if (err) return reject(err);
        resolve(writeStream);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteFileOrDirectory = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const smb = getSMBClient();
      smb.unlink(path, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};
