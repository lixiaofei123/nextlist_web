var cookies = require("vue-cookie");


var util = {
  methods: {
    wellSize(size) {
      if (isNaN(size)) {
        return "0 Byte"
      }
      if (size <= 1024) {
        // byte
        return size.toFixed(2) + " Byte";
      } else if (size <= 1024 * 1024) {
        return (size / 1024).toFixed(2) + " KB";
      } else if (size <= 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + " MB";
      } else if (size <= 1024 * 1024 * 1024 * 1024) {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
      } else {
        return (size / (1024 * 1024 * 1024 * 1024)).toFixed(2) + " TB";
      }
    },
    fileType: function (item) {
      if (item.isDict) {
        return "directory";
      } else {
        if (item.fileType.indexOf("video") === 0) {
          return "video";
        }
        if (item.fileType.indexOf("image") === 0) {
          return "image";
        }

        if (item.fileType.indexOf("audio") === 0) {
          return "audio";
        }

        if (item.fileType.indexOf("document") !== -1) {
          return "document";
        }

        if (
          item.fileType.indexOf("zip") !== -1 ||
          item.fileType.indexOf("compress") !== -1
        ) {
          return "tar";
        }

        return "unknown";
      }
    },
    findDirPassword(dir) {
      let split = dir.split("/");
      for (let i = 0; i < split.length; i++) {
        let key = encodeURIComponent(`password_${split.join("/")}`);
        let password = cookies.get(key);
        if (password) {
          return password;
        }
        split.pop();
      }
      return "";
    },
    encodeURI(url) {
      return url
    },
  }
}

export default util