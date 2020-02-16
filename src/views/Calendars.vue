<template>
  <div>
    <v-row class="fill-height">
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
                <v-btn icon>
                  <v-icon>mdi-heart</v-icon>
                </v-btn>
                <v-btn icon>
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
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
                    詳細資料：
                    <span v-html="selectedEvent.details"></span>
                  </p>
                  <p>
                    聯 絡 人：
                    <span v-html="selectedEvent.location"></span>
                  </p>
                </div>
                <div v-else>
                  <v-form>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field label="開始時間："></v-text-field>
                        </v-col>

                        <v-col cols="12">
                          <v-text-field label="結束時間："></v-text-field>
                        </v-col>

                        <v-col cols="12">
                          <v-text-field label="地 點："></v-text-field>
                        </v-col>

                        <v-col cols="12">
                          <v-text-field label="詳細資料："></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-form>
                </div>
              </v-card-text>
              <v-card-actions>
                <div v-if="!Event_edit">
                  <v-btn
                    text
                    color="secondary"
                    @click="selectedOpen = false;Event_edit=false"
                  >Cancel</v-btn>
                </div>
                <div v-else>
                  <v-btn
                    text
                    color="secondary"
                    @click="selectedOpen = false;Event_edit=false"
                  >Cancel</v-btn>
                  <v-btn color="secondary" @click="selectedOpen = false;Event_edit=false">存檔</v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-sheet>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => ({
    weekdays: [1, 2, 3, 4, 5, 6, 0],
    focus: "",
    type: "month",
    typeToLabel: {
      month: "月",
      week: "週",
      day: "日"
    },

    start: null,
    end: null,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [
      {
        name: "Weekly Meeting",
        start: "2020-02-07 09:00",
        end: "2020-02-07 10:00",
        color: "grey darken-1"
      },
      {
        name: "Thomas' Birthday",
        start: "2020-02-10",
        color: "deep-purple",
        details: "詳細資料",
        location: "",
        contactPerson: "謝孟良 分機：2222"
      },
      {
        name: "Mash Potatoes",
        start: "2020-02-09 12:30",
        end: "2020-02-09 15:30",
        color: "blue"
      }
    ],

    Event_edit: false,

    colors: [
      "blue",
      "indigo",
      "deep-purple",
      "cyan",
      "green",
      "orange",
      "grey darken-1"
    ],
    names: [
      "Meeting",
      "Holiday",
      "PTO",
      "Travel",
      "Event",
      "Birthday",
      "Conference",
      "Party"
    ]
  }),
  computed: {
    title() {
      console.log(this);
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }

      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);
      const suffixMonth = startMonth === endMonth ? "" : endMonth;

      const startYear = start.year;
      const endYear = end.year;
      const suffixYear = startYear === endYear ? "" : endYear;

      const startDay = start.day + this.nth(start.day);
      const endDay = end.day + this.nth(end.day);

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
  },
  methods: {
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
    updateRange({ start, end }) {
      const events = [];

      const min = new Date(`${start.date}T00:00:00`);
      const max = new Date(`${end.date}T23:59:59`);
      const days = (max.getTime() - min.getTime()) / 86400000;
      const eventCount = this.rnd(days, days + 20);

      for (let i = 0; i < eventCount; i++) {
        const allDay = this.rnd(0, 3) === 0;
        const firstTimestamp = this.rnd(min.getTime(), max.getTime());
        const first = new Date(firstTimestamp - (firstTimestamp % 900000));
        const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000;
        const second = new Date(first.getTime() + secondTimestamp);

        events.push({
          name: this.names[this.rnd(0, this.names.length - 1)],
          start: this.formatDate(first, !allDay),
          end: this.formatDate(second, !allDay),
          color: this.colors[this.rnd(0, this.colors.length - 1)]
        });
      }

      this.start = start;
      this.end = end;
      this.events = events;
      console.log("events", this.events);
      this.events = [
        {
          name: "Weekly Meeting",
          start: "2020-02-07 09:00",
          end: "2020-02-07 10:00",
          color: "grey darken-1"
        },
        {
          name: "Thomas' Birthday",
          start: "2020-02-10",
          color: "deep-purple"
        },
        {
          name: "Mash Potatoes",
          start: "2020-02-09 12:30",
          end: "2020-02-09 15:30",
          color: "blue"
        }
      ];
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    formatDate(a, withTime) {
      return withTime
        ? `${a.getFullYear()}-${a.getMonth() +
            1}-${a.getDate()} ${a.getHours()}:${a.getMinutes()}`
        : `${a.getFullYear()}-${a.getMonth() + 1}-${a.getDate()}`;
    },
    editEvent() {
      this.Event_edit = true;

      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      setTimeout(() => open, 10);

      // const open = () => {

      // // this.events.push({
      // //   name: "Thomas' Birthday",
      // //   start: "2020-02-29",
      // //   color: "red",
      // //   details:
      // //     "詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料詳細資料",
      // //   location: "dfasdfasdfas",
      // //   contactPerson: "謝孟良 分機：2222"
      // // });
      //   setTimeout(() => (this.Event_edit = true), 10);
      //   setTimeout(() => (this.Event_edit = true), 10);
      //   setTimeout(() => (open), 10);
      // };
    }
  }
};
</script>



<style>
</style>
