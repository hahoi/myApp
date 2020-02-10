<template>
  <div>
    <h3>資料庫結構練習</h3>
    <p>collection集合(主資料)及collection子集合(子資料)練習</p>
    <v-btn @click="mainTransfer">主資料庫轉換</v-btn>
    <v-btn @click="progressTranser">進度填報子資料轉換</v-btn>
    <v-btn @click="readDatabase">讀取全部資料</v-btn>
    <v-btn @click="search1">查詢練習1</v-btn>
    <v-btn @click="search2">查詢練習2</v-btn>
    <v-btn @click="search3">查詢練習3</v-btn>
    <p></p>
    <p></p>
    <hr />
    <p></p>
    <p></p>

    <h3>集合(主資料)及陣列(子資料)，所有時間欄位改為字串</h3>
    <p></p>
    <v-btn @click="mainTransfer1">主資料庫轉換</v-btn>
    <v-btn @click="readDatabase3">讀取全部資料</v-btn>
  </div>
</template>

<script>
import { dbFirestore, dbStorage, databaseName } from "@/fb";
import moment from "moment";
export default {
  name: "",
  data() {
    return {
      TLFM_data: []
    };
  },
  components: {},
  created() {},
  mounted() {},
  watch: {},
  computed: {},
  methods: {
    mainTransfer() {
      //先讀取ＴＬＦＭＣＤ的資料，存在TLFM_data
      dbFirestore
        .collection(databaseName)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            this.TLFM_data.push(doc.data());
          });
        })
        //寫入新資料庫
        .then(() => {
          this.TLFM_data.forEach(item => {
            console.log(item);
            let doc = {
              id: item.id,
              pid: item.pid,
              title: item.title || "",
              depart: item.depart || "",
              startDate:
                moment(item.startdate.toDate()).format("YYYY-MM-DD") || "",
              endDate: moment(item.enddate.toDate()).format("YYYY-MM-DD") || "",
              expanded: item.expanded,
              status: item.status
            };

            dbFirestore
              .collection("TLFMCDV2")
              .doc(item.id)
              // .set(doc) //第一次用set
              // .update(doc)
              .then(() => {
                console.log(doc);
              });
          });
        });
    },
    progressTranser() {
      //先讀取ＴＬＦＭＣＤ的資料，存在TLFM_data
      dbFirestore
        .collection(databaseName)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            this.TLFM_data.push(doc.data());
          });
        })
        //寫入子資料庫
        .then(() => {
          this.TLFM_data.forEach(item => {
            let progress = item.process || [];
            // let i = 0;
            // console.log(progress);

            progress.forEach((item2, index) => {
              // console.log(item.id, item2, index);
              // let n = index.toString();
              item2.createAt = new Date(moment(item2.pgdate.toDate()));
              item2.pgdate =
                moment(item2.pgdate.toDate()).format("YYYY-MM-DD") || "";
              // console.log(item2);

              dbFirestore
                .collection("TLFMCDV2")
                .doc(item.id)
                .collection("progress")
                // .add(item2)
                .then(() => {
                  console.log(item2);
                });
            });
          });
        });
    },

    readDatabase() {
      let temp = [];
      dbFirestore
        .collection("TLFMCDV2")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            temp.push(doc.data());
          });
        })
        .then(() => {
          // console.log(temp)
          temp.forEach(item => {
            // console.log(item.id);
            if (item.id) {
              let progress = [];
              dbFirestore
                .collection("TLFMCDV2")
                .doc(item.id)
                .collection("progress")
                .orderBy("createAt", "desc")
                .get()
                .then(q => {
                  q.forEach(q1 => {
                    // console.log(q1.data())
                    progress.push({ id: q1.id, ...q1.data() });
                  });
                  item.progress = [...progress];
                });
            }
          });

          console.log("temp", temp);

          // temp['progress'] = progress
        });
    },
    search1() {
      dbFirestore
        .collection("TLFMCDV2")
        .where("endDate", "<=", "2018-09-01")
        .get()
        .then(q => {
          q.forEach(doc => {
            console.log(doc.data());
          });
        });
    },
    search2() {
      dbFirestore
        .collectionGroup("progress")
        .where("pgdate", "<=", "2018-10-01")
        // .where("pgdesc", "==", '')
        .get()
        .then(q => {
          q.forEach(doc => {
            console.log(doc.data());
          });
        })
        .catch(function(error) {
          console.error("資料庫儲存失敗！", error);
        });
    },
    search3() {
      dbFirestore
        .collection("TLFMCDV2")
        .where("endDate", "==", "2018-10-31") //目前測試只能是等於，不能大小於
        .where("depart", "==", "環保局")
        .get()
        .then(q => {
          q.forEach(doc => {
            console.log(doc.data());
          });
        });
    },

    mainTransfer1() {
      //先讀取ＴＬＦＭＣＤ的資料，存在TLFM_data
      let TLFM_data = [];
      dbFirestore
        .collection(databaseName)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            TLFM_data.push(doc.data());
          });
        })
        //寫入新資料庫
        .then(() => {
          TLFM_data.forEach(item => {
            // console.log(item.id,item.title);
            let doc = {
              id: item.id,
              pid: item.pid,
              title: item.title || "",
              depart: item.depart || "",
              startDate:
                moment(item.startdate.toDate()).format("YYYY-MM-DD") || "",
              endDate: moment(item.enddate.toDate()).format("YYYY-MM-DD") || "",
              expanded: item.expanded,
              status: item.status,
              progress: item.process || []
            };
            if (doc.progress.length > 0) {
              doc.progress.forEach(item2 => {
                // item2.createAt = new Date(moment(item2.pgdate.toDate()));
                item2.pgdate =
                  moment(item2.pgdate.toDate()).format("YYYY-MM-DD") || "";
              });
            }
            // console.log(doc);
            dbFirestore
              .collection("TLFMCDV3")
              .doc(item.id)
              .set(doc) //第一次用set
            //   // .update(doc)
              .then(() => {
                console.log(doc);
              });
          });
        });
    },
    readDatabase3(){
      let temp = [];
      dbFirestore
        .collection("TLFMCDV2")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            temp.push(doc.data());
          });
        })
        .then(()=>{
          console.log(temp)
        })

    }
  }
};
</script>

<style>
</style>
