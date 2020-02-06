<template>
  <div>
    <h1>將資料拷貝到另一資料庫</h1>
    <div>
      <v-btn @click="multidatabase_TLFM">pthg(TLFM)_copyto_pthgDB_RealtimeDatabase</v-btn>
    </div>
    <br />
    <div>
      <v-btn @click="settingTrans">pthg(setting)_copyto_pthgDB_RealtimeDatabase</v-btn>
    </div>
    <br />
    <div>
      <v-btn @click="userTrans">pthg(users)_copyto_pthgDB_RealtimeDatabase</v-btn>
    </div>
    <br />
    <div>
      <v-btn @click="">RealtimeDatabase_to_firestore(目前還未找到方法)</v-btn>
    </div>
    <!-- <v-btn  @click="$router.push({ path: '/DBstructureEX' })">第一頁</v-btn>
    <v-btn small @click="$router.go(-1)">返回</v-btn>-->
  </div>
</template>

<script>
import { dbFirestore, dbStorage, databaseName2 } from "@/fb";

import firebase from "firebase/app";
import "firebase/database";
import "firebase/firestore";
// init
// const app1 = firebase.initializeApp({
//   databaseURL: "https://pthg-6750e.firebaseio.com"
// });

//目前只看到realtime database有 multiple 功能
const app2 = firebase.initializeApp(
  {
    databaseURL: "https://pthgdb-9549c.firebaseio.com"
  },
  "app2"
);

var database2 = firebase.database(app2);

export default {
  name: "",
  data() {
    return {
      db_data: [],
      setting: [],
      users:[],
    };
  },
  components: {},
  created() {},
  mounted() {},
  watch: {},
  computed: {},
  methods: {
    multidatabase_TLFM() {
      dbFirestore
        .collection(databaseName2)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            // this.db_data.push(doc.data());
            this.db_data.push(doc.data());
          });
        })

        //寫入第二個資料庫的 realtime database
        .then(() => {
          this.db_data.forEach(item => {
            console.log(item);
            let doc = {
              id: item.id,
              pid: item.pid,
              title: item.title || "",
              depart: item.depart || "",
              startDate: item.startdate || "",
              endDate: item.enddate || "",
              expanded: item.expanded,
              status: item.status
            };

            database2.ref("/2020test/" + doc.id).set(doc);
            // .collection("2020")
            // .doc(item.id)
            // // .set(doc) //第一次用set
            // // .update(doc)
            // .then(() => {
            //   console.log(doc);
            // });
          });
        });
    },

    settingTrans(){
      dbFirestore
        .collection("SettingData")
        .get()
        .then(qs => {
          qs.forEach(doc => {
            this.users.push(
              { id: doc.id,
                data: doc.data()              
              });
          });
        })

        //寫入第二個資料庫的 realtime database
        .then(() => {
          this.users.forEach(doc => {
            console.log(doc);
            database2.ref("/2020SettingData/" + doc.id).set(doc);
          });
        });
    },

    userTrans(){
      dbFirestore
        .collection("MyAppUsers")
        .get()
        .then(qs => {
          qs.forEach(doc => {
            this.users.push(
              { id: doc.id,
                data: doc.data()              
              });
          });
        })

        //寫入第二個資料庫的 realtime database
        .then(() => {
          this.users.forEach(doc => {
            console.log(doc);
            database2.ref("/2020Users/" + doc.id).set(doc);
          });
        });
    },


    RealtimeDatabase_to_firestore() {
      //目前還找不到方法，在資料庫1 操作 資料庫2 firestore
    }
  }
};
</script>

<style>
</style>
