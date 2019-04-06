import moment from "moment";

export default {
  methods: {
    getDateTime: function(date = null){

      date = date ? new Date(date) : new Date;

      return moment(date).format('YYYYMMDDHHmmss');
    },
    getDateTimeFormat: function(date = moment().format('YYYY/MM/DD HH:mm:ss'), to = 'YYYY/MM/DD HH:mm:ss', from = 'YYYYMMDDHHmmss'){

      return moment(date, from).format(to);
    }
  }
}