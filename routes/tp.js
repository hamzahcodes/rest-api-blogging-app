import fs from 'fs'
import path from 'path'

const clearImage = (filePath) => {
    const __dirname = path.resolve();
    filePath = path.join(__dirname, '..', filePath)
    console.log(filePath);
    fs.unlink(filePath, (err) => { 
        console.log(err.path)
        console.log(err.path === filePath);
    })
}

clearImage('images/12cabd26-1bf2-4fb0-bbdb-166c6d789824-coding.jpg')
