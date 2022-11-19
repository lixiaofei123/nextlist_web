const axios = require("axios");
var cookies = require("vue-cookie");

import qs from 'qs'


const config = {
    url: window.config.apiHost + window.config.apiVersion
 };

axios.interceptors.request.use(
    (conf) => {
        if (conf.url.indexOf(config.url) !== -1) {
            let authorization = cookies.get("authorization");
            if (authorization !== "") {
                conf.headers["authorization"] = authorization;
            }
        }

        return conf;
    },
    function (error) {
        return Promise.reject(error);
    }
);



axios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        // if (error.response) {
        //     if (error.response.status === 401) {
        //         return Promise.reject('未授权');
        //     }
        // }
        return Promise.reject(error.response);
    }
);

function login(username, password, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };

    axios
        .post(`${config.url}/user/login`, qs.stringify({
            username: username,
            password: password
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then((resp) => {
            resolve(resp.data)
        })
        .catch((err) => reject(err));
}

function registerUser(user, resolve, reject){
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
    .post(`${config.url}/user/register`, user)
    .then((resp) => {
        resolve(resp.data)
    })
    .catch((err) => reject(err));
}

function myinfo(resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .get(
            `${config.url}/user/info`
        )
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}


function listDirByPath(path, password,page,count, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .get(
            `${config.url}/file/dir?path=${path}&password=${password}&page=${page}&count=${count}`
        )
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function fileInfo(fid,password, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };

    axios
        .get(
            `${config.url}/file/${fid}?password=${password}`
        )
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function basefileInfo(fid, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };

    axios
        .get(
            `${config.url}/file/baseinfo/${fid}`
        )
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}



function mkDir(fid, name, permission,password, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };

    let url = `${config.url}/admin/dir`
    if(fid){
        url = `${config.url}/admin/dir/${fid}`
    }

    axios
        .put(url, qs.stringify({
            name: name,
            permission: permission,
            password: password,
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function preMkFile(fid, name, fileSize, fileType, permission, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };

    let url = `${config.url}/admin/file`
    if(fid){
        url = `${config.url}/admin/file/${fid}`
    }

    axios
        .post(url, qs.stringify({
            name: name,
            permission: permission,
            fileSize: fileSize,
            fileType: fileType
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function searchFile(keyword, page, count,resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/file/search?page=${page}&count=${count}`, qs.stringify({
            keyword: keyword,
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function SignUploadUrl(key, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/admin/driver/sign/upload`, qs.stringify({
            key: key,
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function SignDeleteUrl(key, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/admin/driver/sign/delete`, qs.stringify({
            key: key,
        }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function confirmFile(fileid, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/admin/confirm/file/${fileid}`)
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}


function syncFile(path, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/admin/sync?path=${path}`)
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}




function countFile( resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/file/count`)
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}


function siteConfig( resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .get(`${config.url}/site/config`)
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}



function delFile(fid, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .delete(`${config.url}/admin/file/${fid}`)
        .then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function uploadFile(url, file, uploadProgress, resolve, reject) {
    uploadProgress = uploadProgress || function () { };
    resolve = resolve || function () { };
    reject = reject || function () { };

    axios.put(url, file, {
        headers: {
            'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
            var percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
            );
            uploadProgress(percentCompleted);
        }
    }).then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function deleteFileFromDriver(url, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };

    axios.delete(url).then((resp) => resolve(resp.data))
        .catch((err) => reject(err));
}

function readFile(url,resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .get(`${url}`)
        .then((resp) => {
            resolve(resp.request.responseText)
        })
        .catch((err) => reject(err));
}

// 安装所需要的接口

function checkSiteIsReady(resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/site/status`)
        .then((resp) => {
            resolve(resp.data)
        })
        .catch((err) => reject(err));
}

function checkDB(dbconfig, resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/init/check/db`,dbconfig)
        .then((resp) => {
            resolve(resp.data)
        })
        .catch((err) => reject(err));
}

function checkDriver(driverConfig,resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/init/check/driver`,driverConfig)
        .then((resp) => {
            resolve(resp.data)
        })
        .catch((err) => reject(err));
}

function installSite(siteConfig,resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/init/config`,siteConfig)
        .then((resp) => {
            resolve(resp.data)
        })
        .catch((err) => reject(err));
}

function reloadSite(resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .post(`${config.url}/init/reload`)
        .then((resp) => {
            resolve(resp.data)
        })
        .catch((err) => reject(err));
}

function getDriverprops(resolve, reject) {
    resolve = resolve || function () { };
    reject = reject || function () { };
    axios
        .get(`${config.url}/init/driverprops`)
        .then((resp) => {
            resolve(resp.data)
        })
        .catch((err) => reject(err));
}


export {
    fileInfo,
    mkDir,
    preMkFile,
    delFile,
    searchFile,
    uploadFile,
    SignUploadUrl,
    SignDeleteUrl,
    confirmFile,
    login,
    myinfo,
    listDirByPath,
    deleteFileFromDriver,
    countFile,
    readFile,
    basefileInfo,
    syncFile,
    siteConfig,
    registerUser,
    checkSiteIsReady,
    checkDB,
    checkDriver,
    installSite,
    getDriverprops,
    reloadSite
};