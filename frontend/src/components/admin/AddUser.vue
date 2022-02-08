 <template>

  <div class="list row">
      
    <div class="col-md-8">
      <h4>Create a new User</h4>
      <form>

        <div class="form-group">
          <label for="URI">Username</label>
          <input type="text" class="form-control my-2" id="Name"
            v-model="Name"
          />
          <p class="small text-warning">{{ nameMessage }}</p>
        </div>
        
        <div class="form-group">
          <label for="URI">E-mail</label>
          <input type="text" class="form-control my-2" id="Email"
            v-model="Email"
          />
          <p class="small text-warning">{{ emailMessage }}</p>
        </div>

        <div class="form-group my-5">
          <label for="Provider">Password</label>
          <input type="password" class="form-control my-2" id="Password"
            v-model="Password"
          />
          <label for="Provider">Re-type password</label>
          <input type="password" class="form-control my-2" id="PasswordCheck"
            v-model="PasswordCheck"
          />
          <p class="small text-warning">{{ passwordMessage }}</p>
        </div>

        <div class="my-2">
          <label for="genreDataList" class="form-label">Providers:</label>
          <input class="form-control" list="datalistOptionsGenre"
              id="genreDataList" placeholder="Type to search..."
              v-on:change="addProvider"
              v-on:click="addProvider">
              <datalist id="datalistOptionsGenre">
              <option
                  v-for="(item, index) in providers_ui"
                  v-bind:key="index"
                  v-bind:value="item.Id"
                  >
                  {{item.Names[0].name}}
              </option>
            </datalist>

            <div class="btn-group">
              <ul class="px-0 btn-group-sm">
                <li v-for="(item, index) in SelectedProviders" 
                    v-bind:id="index"
                    v-bind:key="index"
                    v-on:click="removeProvider"
                    class="btn btn-outline-primary mx-1 my-1">{{item.name}} <span v-bind:id="index" class="badge small bg-primary">x</span></li>
              </ul>
            </div>
        </div>


        <label>Admin:</label><br>
        <div class="btn-group btn-group-sm my-2" role="group" aria-label="Basic radio toggle button group" >
          <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" :checked="admin">
          <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
  
          <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio" :checked="!admin">
          <label class="btn btn-outline-primary" for="btnradioNo">No</label>
        </div>

      </form>
      
    </div>
    <div class="col-md-4">
      <div class="btn-group btn-group-sm my-2" role="group">

        <button type="submit" class="btn btn-outline-primary"
          @click="createUser"
        >
          Create
        </button>
      </div>
      <p class="small ">{{ message }}</p>
    </div>

  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService"
import UserDataService from "../../services/UserDataService"


export default {
  name: "user-add",
  data() {
    return {
      message: '',
      nameMessage: "",
      passwordMessage: "",
      emailMessage: "",

      providers_ui: [],
      SelectedProviders: [],

      Name: "",
      Email: "",
      Password: "",
      PasswordCheck: "",

      admin: false,
    };
  },
  methods: {
    getProviders() {
        ProviderDataService.getAll()
        .then(response => {
            this.providers_ui = response.data            
        })
        .catch(e => {
            console.log(e)
            setTimeout(() => {
                this.$router.push({ name: "admin" });
            }, 1000)
        })
    },

    validateFields() {
      this.nameMessage = ""
      this.passwordMessage = ""
      this.emailMessage = ""
      this.message = ""
      let valid = true

      if(this.Name == "") {
          this.nameMessage = "Name cannot be empty"
          valid = false
      }

      if(this.Email == "") {
          this.emailMessage = "Email cannot be empty"
          valid = false
      } 
      else {      
        if(!this.Email.includes("@")) {
            this.emailMessage = "Please check that the e-mail is correct"
            valid = false
        }
        else if(!this.Email.split("@")[1].includes(".")) {
            this.emailMessage = "Please check that the e-mail is correct"
            valid = false
        }
      }
      

      if(this.Password !== "") {
        if(this.Password.length < 12) {
          this.passwordMessage = "Pass length must be 12 or more. "
          valid = false
        }
        if(this.Password !== this.PasswordCheck) {
          this.passwordMessage += "Passwords do not match, please check!"
          valid = false
        }
      } else {
        this.passwordMessage = "Password cannot be empty"        
        valid = false
      }

      if(!valid) {
        this.message = "Please check all missing fields"        
      }

      return valid
    },

    createUser() {
      if( !this.validateFields() ) return

      let prov = []
      this.SelectedProviders.forEach(sp => prov.push(+sp.value))
      const data = { 
          Name: this.Name,
          Email: this.Email || "Not defined",
          Password: this.Password,
          Providers: JSON.stringify(prov),
          Role: this.admin ? "admin" : "user"
      }
      //console.log("POST", data);
      
      UserDataService.create(data)
          .then(response => {
            console.log(response.data);
            this.message = 'The user was created successfully!';

            setTimeout(() => {
                this.$router.push({ name: "admin" });
            }, 1000)
          })
          .catch(e => {
            console.log(e);
            this.message = 'Error creating user';
          });
    },


    addProvider(item) {
        const value = item.target ? item.target.value : item
        const valid = this.providers_ui.find(el => {
            return el.Id === +value
        })   
        if(valid) {
            this.SelectedProviders.push({ name: valid.Names[0].name, value: value});
        }

        if(item.target) item.target.value = null
    },
    removeProvider(item) {
        this.SelectedProviders.splice(item.target.id, 1)
    },

    regulatorRadio(item) {
        if(item.target.id === "btnradioYes") {
            this.admin = true
        } 
        else {
            this.admin = false
        }        
    }
  },
  mounted() {
    this.getProviders()
  }
};
</script>

<style scoped>
.edit-form {
  max-width: 300px;
  margin: auto;
}
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}

</style>