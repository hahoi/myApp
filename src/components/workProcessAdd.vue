<template>
  <div>
    <v-toolbar dark color="indigo">
      <v-btn dark text class="px-0" @click="ProcessClose">
        <v-icon>mdi-backspace</v-icon>
        <span class="title">退回</span>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn dark text class="px-0" @click="ProcessSave">
        <v-icon>mdi-content-save-outline</v-icon>
        <span class="title">儲存</span>
      </v-btn>
    </v-toolbar>

    <v-card height="100vh">
      <v-card-title>{{addProcess ? "新增" : "修改已" }}填報資料</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-container class="text-center">
            <div class="text-center mb-4">
              <v-overlay :opacity="0.5" z-index="1" :value="alert">
                <v-alert color="red" dark transition="scale-transition">{{ alertResult }}</v-alert>
              </v-overlay>
            </div>

            <v-col cols="12">
              <v-dialog
                ref="startDateDialog"
                v-model="startDateDialogModal"
                :return-value.sync="propData4.t_pgdate"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="propData4.t_pgdate"
                    label="填報日期"
                    :rules="[rules.required]"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="propData4.t_pgdate"
                  first-day-of-week="1"
                  locale="zh-TW"
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="startDateDialogModal = false">Cancel</v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.startDateDialog.save(propData4.t_pgdate)"
                  >OK</v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="進度說明"
                v-model="propData4.pgdesc"
                :rules="[(v) => v.length <= 25 || '輸入字數最多25個字！']"
                :counter="25"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <!-- 有圖片不是pdf，顯示圖片 -->
              <div v-if="propData4.cfmpic != '' &&　!propData4.pdf">
                <img v-bind:src="propData4.cfmpic" style="width:100px" />
                <br />
              </div>
            </v-col>
            <v-col cols="12">
              <input
                id="inputimage"
                type="file"
                @change="handleFileSelect"
                style="display:none"
                ref="fileInput"
                accept="image/*, .pdf"
              />
              <v-btn v-show="selectimage" raised @click="$refs.fileInput.click()">佐證資料</v-btn>
              <div class="imghandle" v-if="hasImage">
                <ul>
                  <li v-for="(item,key) in imageFiles">
                    <span class="delbtn" @click="delImage(key)">
                      <v-icon large color>mdi-delete-forever</v-icon>
                    </span>
                    {{item.filename}}
                    <br />
                    <div>
                      <img v-bind:src="item.imageDataUrl" style="width:100px" />
                      <br />
                      <!-- <input v-model="item.discription" placeholder="請輸入圖片說明"><br> -->
                      <div v-if="item.GPSLatitude">
                        緯度：{{item.GPSLatitude}}
                        <br />
                        經度：{{item.GPSLongitude}}
                      </div>
                    </div>
                    <!-- <pre>{{item.EXIF}}</pre> -->
                  </li>
                </ul>
                <div id="progress" v-if="progress > 0">
                  <v-progress-circular
                    :size="100"
                    :width="15"
                    :rotate="-90"
                    :value="progress"
                    color="primary"
                  >{{ progress }}</v-progress-circular>
                </div>
                <v-btn class="my-4" v-show="imagesupload" color="info" @click="uploadImage()">上傳圖檔</v-btn>
              </div>
            </v-col>
          </v-container>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { dbFirestore } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";
export default {
  name: "workProcessAdd",
  props: ["propData4","addProcess"],
  data() {
    return {
      alertResult: "",
      alert: false,
      valid: false,

      rules: {
        length: len => v => (v || "").length <= len || `最多${len}個字元`,
        required: v => !!v || "這個欄位必須要輸入",
        size: v => !v || v.size < 2000000 || "頭相照片尺寸小於 2 MB！，不清楚"
      },
      startDateDialogModal: false,

      imageFiles: [], //上傳檔案資訊
      progress: 0,
      imagesupload: false, //上傳存檔按鈕不顯示
      selectimage: true, //顯示佐證資料BUTTUN



    //   propData4:{}
    };
  },
  components: {},
  created() {},
  mounted() {},
  watch: {},
  computed: {
    hasImage() {
      return this.imageFiles.length > 0 ? true : false;
    }
  },
  methods: {
    ProcessSave() {},
    ProcessClose() {
      this.$emit("listenToChild4", false);
    },

    // ======================== 選擇佐證資料、照片======================================
    handleFileSelect(e) {
      let vm = this;
      let Orientation = null;

      if (!e.target.files || !window.FileReader) return;
      let files = e.target.files;
      let filesArr = Array.prototype.slice.call(files);

      this.selectimage = false; //隱藏選擇佐證資料按鈕

      //處理PDF
      // console.log(filesArr[0])
      const file = filesArr[0];
      if (file.type == "application/pdf") {
        const name = +new Date() + "-" + file.name;
        const metadata = {
          contentType: file.type
        };

        const uploadTask = dbFirestore
          .ref()
          .child("/TLFMCD/" + vm.propData.id + "/" + name)
          .put(file, metadata);
        uploadTask.on(
          "state_changed",
          function(snapshot) {
            vm.progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          function(error) {
            // Handle unsuccessful uploads
          },
          function() {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function(downloadURL) {
                vm.editedItem.cfmpic = downloadURL; //link URL
                // console.log(vm.editedItem.cfmpic)
                vm.editedItem.pickey = "/TLFMCD/" + vm.propData.id + "/" + name; //find 鍵值，刪除用
                vm.editedItem.pdf = true; //判斷是否為PDF
              });
          }
        );
        return; //處理完PDF，返回不再繼續處理圖片
      }

      //處理圖片
      filesArr.forEach(function(file, i) {
        if (!file.type.match("image.*")) {
          return;
        }
        vm.imageFiles.unshift({
          filename: "", //照片檔名
          imageDataUrl: "", //base64Url
          EXIF: {},
          discription: "", //照片描述
          GPSLatitude: 0, //緯度
          GPSLongitude: 0 //經度
          // GPSLatitudeRef: "",		//南北緯 N北緯 S南緯
          // GPSLongitudeRef: ""		//東西經 E東經 W西經
        });

        let reader = new FileReader();
        let image = new Image();
        // const EXIF = require("exif").ExifImage;

        EXIF.getData(file, function() {
          Orientation = EXIF.getTag(this, "Orientation");
          // console.log(Orientation)
          // vm.imageFiles[i].EXIF = EXIF.getAllTags(this)
          // console.log(EXIF.getAllTags(this))
          let lat_ref = EXIF.getTag(this, "GPSLatitudeRef");
          let lat = EXIF.getTag(this, "GPSLatitude");

          let lng_ref = EXIF.getTag(this, "GPSLongitudeRef");
          let lng = EXIF.getTag(this, "GPSLongitude");

          if (
            lat_ref != undefined &&
            lng_ref != undefined &&
            lng != undefined &&
            lng != undefined
          ) {
            vm.imageFiles[i].GPSLatitude =
              lat_ref == "N"
                ? com_fun.change_latlng(lat)
                : com_fun.change_latlng(lat) * -1;
            vm.imageFiles[i].GPSLongitude =
              lng_ref == "E"
                ? com_fun.change_latlng(lng)
                : com_fun.change_latlng(lng) * -1;
          }
        });
        reader.onload = function(ev) {
          image.src = ev.target.result;
          image.onload = function() {
            let imgWidth = this.width,
              imgHeight = this.height;

            if (imgWidth > imgHeight && imgWidth > 750) {
              imgWidth = 750;
              imgHeight = Math.ceil((750 * this.height) / this.width);
            } else if (imgWidth < imgHeight && imgHeight > 1334) {
              imgWidth = Math.ceil((1334 * this.width) / this.height);
              imgHeight = 1334;
            }

            let canvas = document.createElement("canvas"),
              ctx = canvas.getContext("2d");
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            if (Orientation && Orientation != 1) {
              switch (Orientation) {
                case 6:
                  canvas.width = imgHeight;
                  canvas.height = imgWidth;
                  ctx.rotate(Math.PI / 2);
                  ctx.drawImage(this, 0, -imgHeight, imgWidth, imgHeight);
                  break;
                case 3:
                  ctx.rotate(Math.PI);
                  ctx.drawImage(
                    this,
                    -imgWidth,
                    -imgHeight,
                    imgWidth,
                    imgHeight
                  );
                  break;
                case 8:
                  canvas.width = imgHeight;
                  canvas.height = imgWidth;
                  ctx.rotate((3 * Math.PI) / 2);
                  ctx.drawImage(this, -imgWidth, 0, imgWidth, imgHeight);
                  break;
              }
            } else {
              ctx.drawImage(this, 0, 0, imgWidth, imgHeight);
            }
            vm.imageFiles[i].imageDataUrl = canvas.toDataURL("image/jpeg", 0.8); //save 壓縮過的檔案
            vm.imageFiles[i].filename =
              file.name == "image.jpg"
                ? Math.floor(Date.now() / 1000) + ".jpg"
                : Math.floor(Date.now() / 1000) + file.name;
            //iPhone會產生image.jpg檔名，改唯一編碼
            // console.log(vm.imageFiles)
          };
        };
        reader.readAsDataURL(file);
      });
      this.imagesupload = true; //顯示上傳存檔按鈕
    },
    dellatlng(index) {
      let yes_del = confirm("刪除GPS資料？");
      if (yes_del) {
        let vm = this;
        let result = vm.data1.find(obj => obj.id == vm.tid);
        let key = result.images[index].key;
        result.images[index].center.lat = 0;
        result.images[index].center.lng = 0;
        place_data.set(vm.data1);
      }
    },

    delImage: function(index) {
      //del 螢幕顯示
      this.imageFiles.shift(index);
      this.selectimage = true //顯示選擇佐證資料按鈕
    },
    removeImage: function(e) {
      this.imageFiles = [];
    },

    //上傳圖片、照片檔案
    uploadImage: function() {
      let vm = this;
      //let result = vm.data1.find(obj => obj.id == vm.tid);  //propData

      let imageFiles = vm.imageFiles;
      let metadata = { contentType: "image/jpeg" };

      imageFiles.forEach((item, index, array) => {
        let uploadTask = db
          .storage()
          .ref()
          .child("/TLFMCD/" + vm.propData.id + "/" + item.filename)
          .putString(item.imageDataUrl, "data_url");

        uploadTask.on(
          "state_changed",
          function(snapshot) {
            //非同步處理
            vm.progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // $("#progress").html('上傳進度： ' + Math.floor(progress) + '%')
          },
          function(error) {
            alert("上傳圖片有錯誤！");
          },
          function() {
            //成功

            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function(downloadURL) {
                vm.editedItem.cfmpic = downloadURL; //link URL
                // console.log(vm.editedItem.cfmpic)
                vm.editedItem.pickey =
                  "/TLFMCD/" + vm.propData.id + "/" + item.filename; //find 鍵值
                // console.log(vm.editedItem.pickey)
                vm.imageFiles = []; //螢幕顯示部分，上傳完畢后，需清除
              });
          }
        );
      });
      this.imagesupload = false; //上傳存檔按鈕不顯示
    }
  }
};
</script>
<style scoped>
.images img {
  height: 20px !important;
}
h3 {
  margin-top: 10px;
  font-weight: normal;
}
.imghandle ul {
  list-style: none;
}
.progress {
  margin: 1rem;
}
</style>
