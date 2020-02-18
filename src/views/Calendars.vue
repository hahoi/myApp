<template>
  <div>
    <v-row class="fill-height">
      <div class="text-center mb-4">
        <v-overlay :opacity="0.5" z-index="100" :value="alert">
          <v-alert color="red" dark transition="scale-transition">{{ alertResult }}</v-alert>
        </v-overlay>
      </div>
      <v-col>
        <v-sheet height="64">
          <v-toolbar flat color="white">
            <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">今天</v-btn>
            <v-btn fab text small color="grey darken-2" @click="prev">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <v-btn fab text small color="grey darken-2" @click="next">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
            <v-toolbar-title>{{ title }}</v-toolbar-title>
            <v-spacer></v-spacer>

            <!-- <v-btn fab color="primary" @click="AddEvent">
              <span class="headline">+</span>新增
            </v-btn>-->

            <v-spacer></v-spacer>

            <v-menu bottom right>
              <template v-slot:activator="{ on }">
                <v-btn outlined color="grey darken-2" v-on="on">
                  <span>{{ typeToLabel[type] }}</span>
                  <v-icon right>mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="type = 'day'">
                  <v-list-item-title>日</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'week'">
                  <v-list-item-title>週</v-list-item-title>
                </v-list-item>
                <v-list-item @click="type = 'month'">
                  <v-list-item-title>月</v-list-item-title>
                </v-list-item>
                <!-- <v-list-item @click="type = '4day'">
                <v-list-item-title>4天</v-list-item-title>
                </v-list-item>-->
              </v-list>
            </v-menu>
          </v-toolbar>
        </v-sheet>
        <v-sheet height="600">
          <v-calendar
            ref="calendar"
            v-model="focus"
            color="primary"
            :events="events"
            :event-color="getEventColor"
            :type="type"
            @click:event="showEvent"
            @click:more="viewDay"
            @click:date="viewDay"
            locale="zh-TW"
            :weekdays="weekdays"
            @change="updateRange"
          ></v-calendar>

          <!-- @change="updateRange" -->

          <v-menu
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
            offset-x
          >
            <v-card color="grey lighten-4" min-width="350px" flat>
              <v-toolbar :color="selectedEvent.color" dark>
                <v-btn icon @click="editEvent">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon class="mr-1" @click="deleteEvent">
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
                <!-- <v-btn icon>
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>-->
              </v-toolbar>
              <v-card-text class="pb-0">
                <div v-if="!Event_edit">
                  <p>
                    開始時間：
                    <span v-html="selectedEvent.start"></span>
                  </p>
                  <p>
                    結束時間：
                    <span v-html="selectedEvent.end"></span>
                  </p>
                  <p>
                    地 點：
                    <span v-html="selectedEvent.location"></span>
                  </p>
                  <p>
                    備 註：
                    <span v-html="selectedEvent.details"></span>
                  </p>
                  <p>
                    聯絡人：
                    <span v-html="selectedEvent.contactPerson"></span>
                  </p>
                </div>
                <div v-else>
                  <v-form ref="form">
                    <v-container>
                      <v-row>
                        <v-col cols="12" class="py-0">
                          <v-text-field
                            label="事由："
                            v-model="selectedEvent.name"
                            :rules="[rules.required]"
                          ></v-text-field>
                        </v-col>
                        <!-- 選擇開始日期 -->
                        <v-col cols="6" class="py-0">
                          <v-dialog
                            ref="startDateRef"
                            v-model="startDateDialog"
                            :return-value.sync="selectedEvent.startDay"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                v-model="selectedEvent.startDay"
                                label="開始日期"
                                prepend-icon="event"
                                :rules="[rules.required]"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="selectedEvent.startDay"
                              first-day-of-week="1"
                              locale="zh-TW"
                              scrollable
                            >
                              <v-spacer></v-spacer>
                              <v-btn text color="primary" @click="startDateDialog = false">Cancel</v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="$refs.startDateRef.save(selectedEvent.startDay)"
                              >OK</v-btn>
                            </v-date-picker>
                          </v-dialog>
                        </v-col>

                        <!-- 選擇開始時間： -->
                        <v-col cols="6" class="py-0">
                          <v-dialog
                            ref="startTimeRef"
                            v-model="startTimeDialog"
                            :return-value.sync="selectedEvent.startTime"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                v-model="selectedEvent.startTime"
                                label="開始時間"
                                prepend-icon="access_time"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              v-if="startTimeDialog"
                              v-model="selectedEvent.startTime"
                              full-width
                              :max="selectedEvent.endTime"
                            >
                              <v-spacer></v-spacer>
                              <v-btn text color="primary" @click="startTimeDialog = false">Cancel</v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="$refs.startTimeRef.save(selectedEvent.startTime)"
                              >OK</v-btn>
                            </v-time-picker>
                          </v-dialog>
                        </v-col>

                        <!-- 選擇結束日期 -->
                        <v-col cols="6" class="py-0">
                          <v-dialog
                            ref="endDateRef"
                            v-model="endDateDialog"
                            :return-value.sync="selectedEvent.endDay"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                v-model="selectedEvent.endDay"
                                label="結束日期"
                                prepend-icon="event"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="selectedEvent.endDay"
                              first-day-of-week="1"
                              locale="zh-TW"
                              scrollable
                            >
                              <v-spacer></v-spacer>
                              <v-btn text color="primary" @click="endDateDialog = false">Cancel</v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="$refs.endDateRef.save(selectedEvent.endDay)"
                              >OK</v-btn>
                            </v-date-picker>
                          </v-dialog>
                        </v-col>

                        <!-- 選擇結束時間： -->
                        <v-col cols="6" class="py-0">
                          <v-dialog
                            ref="endTimeRef"
                            v-model="endTimeDialog"
                            :return-value.sync="selectedEvent.endTime"
                            persistent
                            width="290px"
                          >
                            <template v-slot:activator="{ on }">
                              <v-text-field
                                v-model="selectedEvent.endTime"
                                label="結束時間"
                                prepend-icon="access_time"
                                readonly
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-time-picker
                              v-if="endTimeDialog"
                              v-model="selectedEvent.endTime"
                              full-width
                              :min="selectedEvent.startTime"
                            >
                              <v-spacer></v-spacer>
                              <v-btn text color="primary" @click="endTimeDialog = false">Cancel</v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="$refs.endTimeRef.save(selectedEvent.endTime)"
                              >OK</v-btn>
                            </v-time-picker>
                          </v-dialog>
                        </v-col>
                        <v-col cols="12" class="py-0">
                          <v-radio-group v-model="selectedEvent.color" row>
                            <v-radio class="blue lighten-5" color="blue" value="blue"></v-radio>
                            <v-radio class="indigo lighten-5" color="indigo" value="indigo"></v-radio>
                            <v-radio class="purple lighten-5" color="purple" value="purple"></v-radio>
                            <v-radio class="cyan lighten-5" color="cyan" value="cyan"></v-radio>
                            <v-radio class="green lighten-5" color="green" value="green"></v-radio>
                            <v-radio class="orange lighten-5" color="orange" value="orange"></v-radio>
                          </v-radio-group>
                        </v-col>

                        <v-col cols="12" class="py-0">
                          <v-text-field label="地 點：" v-model="selectedEvent.location"></v-text-field>
                        </v-col>

                        <v-col cols="12" class="py-0">
                          <v-text-field label="備 註：" v-model="selectedEvent.details"></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-form>
                </div>
              </v-card-text>
              <v-card-actions>
                <div v-if="!Event_edit">
                  <v-btn text :color="selectedEvent.color" @click.prevent="close">離開</v-btn>
                </div>
                <div v-else>
                  <v-btn text :color="selectedEvent.color" @click.prevent="close">離開</v-btn>
                  <v-btn
                    small
                    :color="selectedEvent.color"
                    @click.prevent="EventSave(selectedEvent)"
                  >存檔</v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>

          <!-- 新增浮動按鈕 -->
          <v-btn  fab color="primary" bottom right absolute @click="AddEvent">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { dbFirestore } from "@/fb";
import moment from "moment";

export default {
  data: () => ({
    alert: false,
    alertResult: "",
    today: new Date().toISOString().substr(0, 10),

    weekdays: [1, 2, 3, 4, 5, 6, 0],
    focus: "",
    type: "month",
    typeToLabel: {
      month: "月",
      week: "週",
      day: "日"
    },

    start: null, //這裡的start是個物件，由calendar產生，與selectedEvent中的start(字串)不同
    end: null, //同上
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    rules: {
      length: len => v => (v || "").length <= len || `最多${len}個字元`,
      required: v => !!v || "這個欄位必須要輸入"
    },
    formValid: false,

    //Date Picker
    Event_edit: false,
    Event_add: false,
    startDateDialog: false,
    endDateDialog: false,
    //time picker
    startTimeDialog: false,
    endTimeDialog: false,

    empty: {
      //這裡的start end 格式 同 event
      name: "",
      start: "",
      end: "",
      color: "blue",
      startDay: new Date().toISOString().substr(0, 10),
      endDay: "",
      startTime: "",
      endTime: "",
      details: "",
      location: "",
      contactPerson: ""
    }
  }),
  computed: {
    title() {
      // console.log(this);
      //這裡的start, end 格式是物件，由calendar自動產生
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }

      const startMonth = this.monthFormatter(start);
      // const endMonth = this.monthFormatter(end);
      // const suffixMonth = startMonth === endMonth ? "" : endMonth;

      const startYear = start.year;
      // const endYear = end.year;
      // const suffixYear = startYear === endYear ? "" : endYear;

      // const startDay = start.day + this.nth(start.day);
      // const endDay = end.day + this.nth(end.day);

      switch (this.type) {
        case "month":
          return `${startYear}年${startMonth}`;
        case "week":
          return `${startYear}年${startMonth}`;
        case "day":
          return `${startYear}年${startMonth}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "GMT",
        month: "long"
      });
    }
  },
  mounted() {
    this.$refs.calendar.checkChange();

    this.getEvents();
  },
  methods: {
    updateRange({ start, end }) {
      this.start = start;
      this.end = end;
    },

    getEvents() {
      let events = [];
      dbFirestore
        .collection("calEvent")
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            let appData = doc.data();
            appData.id = doc.id;
            events.push(appData);
          });
        })
        .then(() => {
          this.events = events;
        });
    },

    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = this.today;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },

    showEvent({ nativeEvent, event }) {
      //             取得滑鼠事件
      // console.log(nativeEvent, nativeEvent.target);
      // console.log("click event", event);
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      //還要再理解
      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open(); //只保留此句程式碼，仍能正確執行
      }
      // Event 介面的 stopPropagation() 方法
      // 可阻止當前事件繼續進行捕捉（capturing）及冒泡（bubbling）階段的傳遞。
      nativeEvent.stopPropagation();
    },
    deleteEvent() {
      // console.log(this.selectedEvent);
      let index = this.selectedEvent.id;
      this.$confirm("確定要刪除這個事件嗎？", {
        color: "red",
        title: "嚴重警告"
      }).then(res => {
        if (res) {
          //螢幕
          this.events.splice(index, 1);
          //資料庫
          dbFirestore
            .collection("calEvent")
            .doc(index)
            .delete()
            .then(() => {
              console.log("資料刪除成功！");
            })
            .then(() => {
              //重新讀取資料庫
              // this.getEvents();
            });
          this.$refs.calendar.checkChange();
          setTimeout(() => this.close(), 10);
        }
      });
    },

    editEvent() {
      // console.log(this.selectedEvent);
      this.Event_edit = true;
      setTimeout(() => (this.selectedOpen = true), 10);
    },
    AddEvent() {
      this.selectedEvent = { ...this.empty };
      this.Event_edit = true;
      this.Event_add = true;
      setTimeout(() => (this.selectedOpen = true), 10);
    },
    EventSave(event) {
      if (!this.$refs.form.validate()) {
        //有錯
        // console.log(this.$refs.form.validate());
        this.ShowAlert("請輸入必要欄位資料！");
        return false;
      } //存檔
      if (event.endDay !== "" && event.startDay > event.endDay) {
        this.ShowAlert("開始日期 大於 結束日期！");
        return false;
      }

      let data = event;
      data.start = `${event.startDay} ${event.startTime}`;
      data.end = `${event.endDay} ${event.endTime}`;
      // console.table("user",this.$store.getters.user);
      let telephone = this.$store.getters.user.telephone || "";
      data.contactPerson = `${this.$store.getters.user.name} ${telephone}`;
      // console.log(event, data);
      //把每個屬性的值有空白的都去掉
      Object.keys(data).forEach(function(key) {
        data[key] = data[key].trim();
      });

      if (this.Event_add) {
        // console.log(data);
        //新增，更新螢幕
        this.events.unshift(data);
        dbFirestore
          .collection("calEvent")
          .doc()
          .set(data)
          .then(() => {
            console.log("新增！", data);
          });
      } else {
        console.log(data);
        dbFirestore
          .collection("calEvent")
          .doc(data.id)
          .set(data)
          .then(() => {
            console.log("更新！", data);
          });
      }
      this.$refs.calendar.checkChange();
      setTimeout(() => this.close(), 10);
      return true;
    },
    close() {
      this.selectedOpen = false;
      this.Event_edit = false;
      this.Event_add = false;
    },
    ShowAlert(alertMsg, showtime = 3000) {
      this.alertResult = alertMsg;
      this.alert = true;
      setTimeout(() => {
        this.alertResult = "";
        this.alert = false;
      }, showtime);
    }
  }
};
</script>



<style>
div.v-input__control {
  height: 30px;
}
</style>
