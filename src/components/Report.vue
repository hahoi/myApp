<template>
  <div>
    <v-toolbar dark color="primary" class="NoPrint">
      <v-btn dark text class="px-0" @click="closeDia">
        <v-icon>mdi-backspace</v-icon>
        <span class="title">退回</span>
      </v-btn>
      <v-spacer></v-spacer>

      <v-btn dark text class="pr-10" v-print="'#oContent'">
        <v-icon>mdi-printer</v-icon>
        <span class="title">列印</span>
      </v-btn>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            class="btn"
            ref="copybtn"
            @click="copyText"
            icon
            large
            v-on="on"
            data-clipboard-target="#oContent"
          >
            <v-icon>mdi-content-copy</v-icon>
            <span class="title">複製</span>
          </v-btn>
        </template>
        <span>複製到剪貼簿</span>
      </v-tooltip>
    </v-toolbar>

    <v-snackbar v-model="snackbar" :timeout="timeout">
      複製到剪貼簿成功
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>

    <div id="oContent" ref="oContent">
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr class="grey lighten-1">
              <th class="text-left font-weight-black" width="28%">工作項目</th>
              <th class="text-left font-weight-black" width="16%">負責單位</th>
              <th class="text-left font-weight-black" width="18%">預定完成日期</th>
              <th class="text-left font-weight-black" width="10%">狀態</th>
              <th class="text-left font-weight-black" width="28%">進度說明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in propData" :key="item.id">
              <td v-html="item.title"></td>
              <td v-html="item.depart"></td>
              <td v-html="item.endDate"></td>
              <td v-html="item.status"></td>
              <td v-html="item.progress"></td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
  </div>
</template>

<script>
import Clipboard from "clipboard";
export default {
  name: "",
  props: ["propData"],
  data() {
    return {
      snackbar: false,
      timeout: 1500,
      dense: true,
      fixedHeader: true,
      tableinnerHTML: "",
      clipboard: null
    };
  },
  components: {},
  created() {},
  mounted() {
    var copybtn = document.getElementsByClassName("btn");
    this.clipboard = new Clipboard(copybtn);
  },
  watch: {},
  computed: {},
  methods: {
    closeDia() {
      this.clipboard.destroy();
      this.$emit("listenToChild", false);
    },
    copyText() {
      new Clipboard("copybtn", function() {
        return this.$refs.oContent.innerHTML; //<!--要複製的內容-->
      });
      //  alert("複製到剪貼簿成功");
      this.snackbar = true;
      // this.clipboard.on("success", function(e) {
      //   console.info("Action:", e.action);
      //   console.info("Text:", e.text);
      //   console.info("Trigger:", e.trigger);

      //   e.clearSelection();
      // });
    },
    copy() {
      // <!--如果在內部new會出現點選兩次在複製成功的現象所以還請各位多多注意-- >
      this.clipboard.on("success", function() {
        alert("複製成功");
        this.clipboard.destroy(); //  < !--銷燬快取, (然後在重新new這樣不會出現點選複製上出現之前複製的內容的情況-- >
        let copybtn = document.getElementsByClassName("btn");
        this.clipboard = new Clipboard(copybtn);
      });
      this.clipboard.on("error", function() {
        alert("複製失敗，請手動複製");
      });
    }
  }
};
</script>

<style>
/* @page{
  size: A4;
  margin: 0;
} */
@media print {
  .NoPrint {
    display: none;
  }
  .v-content {
    overflow: hidden;
  }
  .v-dialog {
    overflow: hidden;
  }
}
</style>
