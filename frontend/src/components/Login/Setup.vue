
<script>
import LoginService from "../../services/LoginService"
export default {
  name: "setup",

  mounted() {
      LoginService.setup()
        .then(response => {
          console.log("success", response.data)
        })
        .catch(e => {
          console.log(e);
        });
  }
};
</script>