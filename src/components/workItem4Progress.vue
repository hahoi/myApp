<template>
  <div class="grey lighten-2">
    <v-toolbar dark color="indigo">
      <v-btn dark text class="py-0 pl-1" @click="ProgressClose">
        <v-icon>mdi-backspace</v-icon>
        <span class="title">退回</span>
      </v-btn>
      <v-spacer></v-spacer>
      <span class="headline lime--text">{{addProgress ? "新增" : "修改" }}</span>
      <v-spacer></v-spacer>
    </v-toolbar>

    <v-card height="100vh" max-width="550" class="mx-auto">
      <v-card-text class="py-0">
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-container class="text-center pb-0">
            <div class="text-center mb-4">
              <v-overlay :opacity="0.5" z-index="1" :value="alert">
                <v-alert color="red" dark transition="scale-transition">{{ alertResult }}</v-alert>
              </v-overlay>
            </div>

            <!-- 單位填報時，填報日期不能修改 -->
            <v-col cols="12" class="py-0" v-if="ifProgressReport">
              <v-text-field
                v-model="propData4.pgdate"
                label="填報日期"
                :rules="[rules.required]"
                readonly
              ></v-text-field>
            </v-col>
            <!-- v-else 管理者可以修改填報日期 -->
            <v-col cols="12" class="py-0" v-else>
              <v-dialog
                ref="startDateDialog"
                v-model="startDateDialogModal"
                :return-value.sync="propData4.pgdate"
                persistent
                width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="propData4.pgdate"
                    label="填報日期"
                    :rules="[rules.required]"
                    readonly
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="propData4.pgdate"
                  first-day-of-week="1"
                  locale="zh-TW"
                  scrollable
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="startDateDialogModal = false">Cancel</v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.startDateDialog.save(propData4.pgdate)"
                  >OK</v-btn>
                </v-date-picker>
              </v-dialog>
            </v-col>

            <v-col cols="12" class="py-0">
              <v-text-field
                label="進度說明"
                v-model="propData4.pgdesc"
                :rules="[rules.required,rules.length(32)]"
                :counter="32"
              ></v-text-field>
            </v-col>
            <v-col cols="12" class="pa-0" align="right">
              <v-btn
                text
                v-if="propData4.cfmpic !== '' && e1!==3"
                color="orange"
                @click="ProgressSave"
              >進度說明存檔</v-btn>
            </v-col>
          </v-container>
        </v-form>
      </v-card-text>

      <template>
        <v-stepper v-model="e1" vertical>
          <v-stepper-header>
            <v-stepper-step :complete="e1 > 1" step="1">步驟1</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="e1 > 2" step="2">步驟2</v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step step="3">步驟3</v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <v-stepper-content step="1">
              <v-card
                class="mb-2"
                color="grey lighten-2"
                height="150"
                align="center"
                justify="center"
              >
                <v-card-text>
                  <!-- 有圖片不是pdf，顯示圖片 -->
                  <div v-if="propData4.cfmpic != '' &&　!propData4.pdf" class="flex">
                    <v-img :src="propData4.cfmpic" max-width="100"></v-img>
                  </div>
                  <div v-if="propData4.pdf">PDF</div>
                  <!-- PDF上傳時顯示進度 -->
                    <v-col cols="4">
                      <span id="uploadProgress" v-if="uploadProgress > 0 ">
                        <v-progress-circular
                          :size="80"
                          :width="10"
                          :rotate="-90"
                          :value="uploadProgress"
                          color="primary"
                        >{{ uploadProgress }}</v-progress-circular>
                      </span>
                    </v-col>


                  <input
                    id="inputimage"
                    ref="fileInput"
                    type="file"
                    @change="handleFileSelect"
                    style="display:none"
                    accept="image/*, .pdf"
                  />
                  <!-- 第二次選相同圖片沒有改變，不會觸發change事件 -->
                </v-card-text>
              </v-card>
              <v-btn color="primary" @click="$refs.fileInput.click();">佐證資料</v-btn>
            </v-stepper-content>

            <v-stepper-content step="2">
              <v-card
                class="mb-2"
                color="grey lighten-2"
                height="150"
                align="center"
                justify="center"
              >
                <v-card-text class="py-0">
                  <v-row class="pa-0">
                    <v-col cols="8" class="pa-0">
                      <div v-for="(item,key) in imageFiles">
                        <span class="delbtn" @click="delImage(key)">
                          <v-icon large color>mdi-delete-forever</v-icon>
                        </span>
                        {{item.filename}}
                        
                        <div>
                          <v-img :src="item.imageDataUrl" max-width="100"></v-img>
                          <!-- <img v-bind:src="item.imageDataUrl" style="width:100px" /> -->
                          <!-- <input v-model="item.discription" placeholder="請輸入圖片說明"><br> -->
                          <!-- <div v-if="item.GPSLatitude">
                            緯度：{{item.GPSLatitude}}<br />
                            經度：{{item.GPSLongitude}}
                          </div> -->
                        </div>
                        <!-- <pre>{{item.EXIF}}</pre> -->
                      </div>
                    </v-col>
                    <v-col cols="4">
                      <span id="uploadProgress" v-if="uploadProgress > 0 ">
                        <v-progress-circular
                          :size="80"
                          :width="10"
                          :rotate="-90"
                          :value="uploadProgress"
                          color="primary"
                        >{{ uploadProgress }}</v-progress-circular>
                      </span>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              <v-btn color="primary" @click="uploadImage();">上傳圖檔</v-btn>
              <!-- <v-btn text @click="ProgressClose">取消</v-btn> -->
            </v-stepper-content>

            <v-stepper-content step="3">
              <v-card
                class="mb-2"
                color="grey lighten-2"
                height="150"
                align="center"
                justify="center"
              >
                <v-card-text>
                  <!-- 有圖片不是pdf，顯示圖片 -->
                  <div v-if="propData4.cfmpic != '' &&　!propData4.pdf">
                    <v-img :src="propData4.cfmpic" max-width="100"></v-img>
                  </div>
                  <div v-if="propData4.pdf">PDF</div>

                </v-card-text>
              </v-card>
              <v-btn color="orange" @click="ProgressSave">完成並存檔</v-btn>
              <!-- <v-btn text @click="ProgressClose">取消</v-btn> -->
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </template>
    </v-card>
  </div>
</template>








<script>
import { dbFirestore, dbStorage, databaseName2 } from "@/fb";
import com_fun from "../utils/function";
import moment from "moment";
export default {
  name: "workItem4Progress",
  props: [
    "propData4",
    "ProgressNodeId",
    "addProgress",
    "ProgressItemIndex",
    "ifProgressReport"
  ],
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
      uploadProgress: 0,

      e1: 1,
      steps: 2
    };
  },
  components: {},
  created() {},
  mounted() {},
  watch: {},
  computed: {
    // hasImage() {
    //   return this.imageFiles.length > 0 ? true : false;
    // }
  },
  methods: {
    ProgressSave() {
      if (!this.$refs.form.validate()) {
        //輸入欄位存有錯誤時，不能繼續
        return false;
      }
      this.imageFiles = []; //圖片螢幕顯示部分，需清除
      // document.getElementById("inputimage").value = ""; //input type=file 清空檔名
      // this.$refs.fileInput.value = ""; //input type=file 清空檔名
      this.uploadProgress = 0; //進度歸零

      //上傳資料，第一層存檔
      this.$emit(
        "listenToChild4",
        this.propData4,
        this.ProgressNodeId,
        this.addProgress,
        this.ProgressItemIndex
      );
      this.e1 = 1;
    },
    ProgressClose() {
      //已上傳的佐證資料，按取消時，要先刪除
      // console.log("pickey",this.propData4.pickey,"addProgress",this.addProgress,"e1",this.e1)
      if (this.propData4.pickey !== "") {
        if (this.e1 === 3) {
          //已上傳
          console.log(this.propData4.pickey);
          dbStorage
            .ref()
            .child(this.propData4.pickey)
            .delete()
            .then(function() {
              console.log("File deleted successfully");
            })
            .catch(function(error) {
              console.log("Uh-oh, an error occurred!");
            });
        }
      }

      this.imageFiles = []; //圖片螢幕顯示部分，需清除
      // document.getElementById("inputimage").value = ""; //input type=file 清空檔名
      // this.$refs.fileInput.value = ""; //input type=file 清空檔名
      this.uploadProgress = 0; //進度歸零
      this.e1 = 1;//回到步驟一
      this.$emit(
        "listenToChild4",
        false, //傳回資料是 false
        this.ProgressNodeId,
        this.addProgress,
        this.ProgressItemIndex
      );
    },

    // ======================== 選擇佐證資料、照片======================================
    handleFileSelect(e) {
      let vm = this;
      let Orientation = null;
      // console.log("e",!e.target.files,e.target.files)
      // console.log("w",!window.FileReader,window.FileReader)

      if (!e.target.files || !window.FileReader) return;
      let files = e.target.files;
      let filesArr = Array.prototype.slice.call(files);

      // console.log(filesArr)
      const file = filesArr[0];


      //=================處理PDF==================
      if (file && file.type == "application/pdf") {
        const name = +new Date() + "-" + file.name;
        const metadata = {
          contentType: file.type
        };

        const uploadTask = dbStorage
          .ref()
          .child("/" + databaseName2 + "/" + vm.ProgressNodeId + "/" + name)
          .put(file, metadata);
        uploadTask.on(
          "state_changed",
          function(snapshot) {
            vm.uploadProgress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          function(error) {
            // Handle unsuccessful uploads
          },
          function() {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function(downloadURL) {
                vm.propData4.cfmpic = downloadURL; //link URL
                // console.log(vm.propData4.cfmpic)
                vm.propData4.pickey =
                  "/" + databaseName2 + "/" + vm.ProgressNodeId + "/" + name; //find 鍵值，刪除用
                vm.propData4.pdf = true; //判斷是否為PDF

                //因PDF不必先顯示在螢幕上，已直接上傳，故跳到步驟三
                vm.e1 = 3;
                // progress圖形不顯示
                // vm.uploadProgress = 0;
              });
          }
        );
        return; //處理完PDF，返回不再繼續處理圖片
      }

      //=====================處理圖片=====================
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
        // 圖片壓縮完顯示在螢幕
        reader.readAsDataURL(file);
      });
      // 跳到步驟2，因不是callback情況，所以放在迴圈外
      this.e1 = 2;
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
      this.e1 = 1;
      // this.selectimage = true; //顯示選擇佐證資料按鈕
    },
    removeImage: function(e) {
      this.imageFiles = [];
    },

    //=============上傳圖片、照片檔案======================
    uploadImage: function() {
      let vm = this;

      let imageFiles = vm.imageFiles;
      let metadata = { contentType: "image/jpeg" };

      imageFiles.forEach((item, index, array) => {
        let uploadTask = dbStorage
          .ref()
          .child(
            "/" + databaseName2 + "/" + vm.ProgressNodeId + "/" + item.filename
          )
          .putString(item.imageDataUrl, "data_url");

        uploadTask.on(
          "state_changed",
          function(snapshot) {
            //非同步處理
            vm.uploadProgress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          function(error) {
            //firebase storage 需要驗證
            //write: if request.auth != null; ，有驗證，可以寫入
            console.log(error);
            alert("上傳圖片有錯誤！");
          },
          function() {
            //成功

            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function(downloadURL) {
                vm.propData4.cfmpic = downloadURL; //link URL
                // console.log(vm.propData4.cfmpic)
                vm.propData4.pickey =
                  "/" +
                  databaseName2 +
                  "/" +
                  vm.ProgressNodeId +
                  "/" +
                  item.filename; //find 鍵值
                console.log(vm.propData4.pickey);
                vm.imageFiles = []; //螢幕顯示部分，上傳完畢后，需清除

                vm.e1 = 3;
                // progress圖形不顯示
                vm.uploadProgress = 0;
              });
          }
        );
      });
    }
  }
};
</script>
<style scoped>
</style>
