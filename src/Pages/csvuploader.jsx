import React from 'react';
import Papa from 'papaparse';
import { db } from '../firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const CsvUploader = () => {
  const handleCSVUpload = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        for (const row of results.data) {
          try {
            const docData = {
              uid: row.uid,
              username: row.username,
              claimedAt: Timestamp.fromDate(parseDate(row.claimedAt)),
              createdAt: Timestamp.fromDate(parseDate(row.createdAt)),
              expiresAt: Timestamp.fromDate(parseDate(row.expiresAt)),
              claimedBin: row.claimedBin,
              isClaimed: row.isClaimed.toLowerCase() === 'true',
              isExpired: row.isExpired.toLowerCase() === 'false',
              itemType: row.itemType,
              points: parseInt(row.points, 10),
            };

            await addDoc(collection(db, 'Points'), docData);
            console.log(`Uploaded point for ${row.username}`);
          } catch (error) {
            console.error('Error uploading row:', row, error);
          }
        }

        alert('✅ CSV upload completed!');
      },
    });
  };

const parseDate = (str) => {
  const cleanedStr = str.replace(' at ', ' ').replace('UTC+8', '+08:00');
  return new Date(cleanedStr);
};
  return (
    <div className="card p-4">
      <h5 className="mb-3">Upload Dummy Point Data (CSV)</h5>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => handleCSVUpload(e.target.files[0])}
        className="form-control"
      />
    </div>
  );
};

export default CsvUploader;
