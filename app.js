const app = Vue.createApp({
  data() {
    return {
      dates: [],
      selectedDate: '',
      showtimes: [],
      moviesData: [],
    };
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    movies() {
      const showsForDate = this.showtimes.filter((s) =>
        s.startTime.startsWith(this.selectedDate)
      );
      return this.moviesData
        .map((movie) => {
          const showtimes = showsForDate.filter(
            (s) => s.movieId === movie.movieId
          );
          return showtimes.length ? { ...movie, showtimes } : null;
        })
        .filter(Boolean);
    },
  },
  methods: {
    formatDate(date) {
      return moment(date, 'YYYY-MM-DD').format('DD MMM YYYY');
    },
    hasAgeRestriction(age) {
      return age > 0;
    },
    formatTime(time) {
      return moment(time).format('HH:mm');
    },
    updateDate(date) {
      this.selectedDate = date;
      const url = new URL(window.location);
      url.searchParams.set('date', date);
      window.history.pushState({}, '', url);
    },
    async fetchData() {
      const [showtimesResponse, moviesResponse] = await Promise.all([
        fetch('showtimes.json'),
        fetch('movies.json'),
      ]);

      this.showtimes = await showtimesResponse.json();
      this.moviesData = await moviesResponse.json();

      this.dates = [
        ...new Set(
          this.showtimes.map((s) => moment(s.startTime).format('YYYY-MM-DD'))
        ),
      ].sort();

      const urlParams = new URLSearchParams(window.location.search);
      let initialDate = urlParams.get('date');

      if (!this.dates.includes(initialDate)) {
        initialDate = this.dates[0];
        const url = new URL(window.location);
        url.searchParams.set('date', initialDate);
        window.history.replaceState({}, '', url);
      }

      this.selectedDate = initialDate;
    },
  },
});

app.mount('#app');
