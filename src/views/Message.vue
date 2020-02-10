<template>
  <div>

  <v-data-table :headers="headers" :items="items" sort-by="calories" class="elevation-1">
    <template v-slot:top>
      <v-toolbar flat color="blue lighten-4">
        <v-toolbar-title>訊息管理</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>

        <!-- 彈跳編輯視窗，因新增slot須放在toolbar裡面，改為全螢幕-->
        <v-dialog v-model="dialog" fullscreen>
          <template v-slot:activator="{ on }">
            <v-btn color="primary" dark class="mb-2" v-on="on">新增訊息</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                <v-text-field label="順序" v-model="editedItem.order"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                <v-text-field label="標題" v-model="editedItem.title"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                <v-text-field label="副標題" v-model="editedItem.subtitle"></v-text-field>
                  </v-col>
                  <v-col cols="12">
                <v-text-field label="說明" v-model="editedItem.explanation"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close">放棄</v-btn>
              <v-btn color="blue darken-1" text @click="save">儲存</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>


    <template v-slot:item.title="{ item }">
      <div v-html="item.title"></div>
    </template>
    <template v-slot:item.subtitle="{ item }">
      <div v-html="item.subtitle"></div>
    </template>
    <template v-slot:item.explanation="{ item }">
      <div v-html="item.explanation"></div>
    </template>


    <template v-slot:item.action="{ item }">
      <v-icon small  color="teal" class="mr-2" @click="editItem(item)">edit</v-icon>
      <v-icon small color="pink" @click="deleteItem(item)">delete</v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize">Reset</v-btn>
    </template>
  </v-data-table>
  </div>
</template>


<script>
  // import Firebase from 'firebase'
import { dbFirestore } from "@/fb";

  export default {
    data: () => ({
      dialog: false,
      depart:[],
      headers: [
        {text:"順序",value: 'order',align: 'center'},
        {text: '標題',value: 'title',align: 'left',sortable: false},    //sortable: false,
        {text: '副標題',value: 'subtitle',align: 'left',sortable: false},    //sortable: false,
        {text: '說明', value: 'explanation' ,align: 'left',sortable: false},
        { text: "編輯", value: "action", sortable: false } //這一行特別注意要加入才有編輯功能
      ],
      items: [],
      editedIndex: -1,
      editedItem: {
        title: '',
        subtitle: '',
        explanation: '',
        order:''
      },
      defaultItem: {
        title: '',
        subtitle: '',
        explanation: '',
        order:''
      }
    }),

    created () {
    this.initialize();
    },
    mounted () {
    },

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? '新增' : '編輯'
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    methods: {
    initialize() {
      dbFirestore
        .collection("SettingData")
        .doc("Messages") 
        .get()
        .then(doc => {
          this.items = [...doc.data().message]
        });
    },


      editItem (item) {
        this.editedIndex = this.items.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },

      deleteItem (item) {
        const index = this.items.indexOf(item)
        this.$confirm("確定要刪除這筆資料嗎？", {
          color: "red",
          title: "嚴重警告"
        }).then(res => {
          if (res) {
            this.items.splice(index, 1)
            dbFirestore.collection("SettingData").doc("Messages").set({message: this.items})
          }
        });
      },

      close () {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
      },

      save () {
        if (this.editedIndex > -1) {
          Object.assign(this.items[this.editedIndex], this.editedItem)   
        } else { 
          this.items.push(this.editedItem)
        }
        dbFirestore.collection("SettingData").doc("Messages").set({message: this.items})
        this.close()
      }
    }
  }
</script>