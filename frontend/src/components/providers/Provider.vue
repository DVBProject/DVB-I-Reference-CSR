 <template>

  
  <transition name="modal">
    <div v-if="confirmDelete">
      <div class="modal-mask">
        <div class="modal-wrapper" role="dialog" aria-labelledby="exampleModalCenterTitle">
          <div class="modal-dialog modal-dialog-centered" tabindex="-1" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Delete Provider</h5>
                <button type="button" class="close btn btn-outline-primary" data-dismiss="modal" aria-label="Close" @click="confirmDelete = !confirmDelete">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <p>ALL related Service Lists will also be deleted!</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal" @click="confirmDelete = !confirmDelete">Cancel</button>
                <button type="button" class="btn btn-danger" @click="deleteProvider" :disabled="sending">Delete</button>          
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
  


  <div v-if="currentProvider" class="edit-form row">

    <div class="col-sm-10">
      <h4>Edit Provider</h4>
      <form>
        

        <label>Provider Names:</label>
        <button class="btn btn-outline-primary mx-2 mb-1" type="button"
              @click="addNameField"
            >
          +
        </button>
        <div class="input-group mb-3">

          
          <div class="col-sm-12 px-0"
              v-for="(name, index) in currentProvider.Names"
              :key="index">      

            <div class="row my-0 mx-0">

              <div class="form-floating px-0 col-sm-5">          
                <input type="text" id="floatingInput" class="form-control mb-1" placeholder="Name"
                    v-model="name.name"/>
                <label for="floatingInput">Name</label>
              </div>

              <div class="form-floating px-0 col-sm-5" >
                <select id="floatingInput2" v-model="name.type" class="form-control mx-2 mb-1"> 
                  <option value="">None</option>
                  <option value="main">Main</option>
                  <option value="variant">Variant</option>
                  <option value="former">Former</option>
                </select>
                <label for="floatingInput2">Type</label>
              </div>


              <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
                :id="index"
                @click="delNameField"
              >
                -
              </button>
            </div>

          </div>        
        </div>
               <div class="form-group">
        <label>Provider Icons:</label>
        <button class="btn btn-outline-primary mx-2 mb-1" type="button"
              @click="addIconField"
            >+</button>
        <div class="input-group mb-3">
          <div class="col-sm-12 px-0"
              v-for="(icon, index) in currentProvider.Icons"
              :key="index">      

            <div class="row my-0 mx-0">

              <div class="form-floating px-0 col-sm-5">          
                <input type="text" id="floatingInput" class="form-control mb-1" placeholder="Name"
                    v-model="icon.content"/>
                <label for="floatingInput">Content</label>
              </div>

              <div class="form-floating px-0 col-sm-2" >
                <select id="floatingInput5" v-model="icon.type" class="form-control mx-2 mb-1"> 
                  <option value="MediaUri">MediaURI</option>
                  <option value="MediaData16">hexBinary</option>
                  <option value="MediaData64">base64Binary</option>
                </select>
                <label for="floatingInpu5">Type</label>
              </div>

              <div class="form-floating px-0 col-sm-2 mx-3 mb-1" v-if="icon.type !== 'MediaUri'">          
                <input type="text" id="floatingInput" class="form-control mb-1" placeholder="mimeType"
                    v-model="icon.mimeType"/>
                <label for="floatingInput">mimeType</label>
              </div>

              <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
                :id="index"
                @click="delIconField"
              >
                -
              </button>
            </div>
          </div>        
        </div>
       </div>

        
        <div class="form-group">
          <label>Organization Kind:</label>
          <input type="text" class="form-control my-2" placeholder="Kind"
              v-model="currentProvider.Kind"/>
        </div>
        <div class="form-group">
          <label for="description">Contact name:</label>
          <button class="btn btn-outline-primary mx-2 mb-1" type="button"
              @click="addContactField"
            >+</button>
          <div class="input-group mb-3">
            <div class="col-sm-12 px-0"
                v-for="(name, index) in currentProvider.ContactName"
                :key="index">
              <div class="row my-0 mx-0">
                <div class="form-floating px-0 col-sm-5">
                  <input type="text" id="floatingInput" class="form-control mb-1" placeholder="Name"
                      v-model="name.name"/>
                  <label for="floatingInput">Name</label>
                </div>

                <div class="form-floating px-0 col-sm-5" >
                  <select :disabled="index== 0" if="floatingInput3" v-model="name.type" class="form-control mx-2 mb-1">
                    <option value="GivenName">Given Name</option>
                    <option value="LinkingName">Linking Name</option>
                    <option value="FamilyName">Family Name</option>
                    <option value="Title">Title</option>
                    <option value="Salutation">Salutation</option>
                    <option value="Numeration">Numeration</option>
                  </select>
                  <label for="floatingInput3">Type</label>
                </div>

                <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
                  :id="index"
                  :disabled="currentProvider.ContactName.length > 1 && index == 0"
                  @click="delContactField"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="description">Jurisdiction:</label>
          <div class="form-floating mb-1">
          <input type="text" id="jurisdictionInputName" class="form-control my-2" placeholder="Name"
              v-model="currentProvider.Jurisdiction.Name"/>
          <label for="jurisdictionInputName">Name</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="jurisdictionInputLine1" class="form-control my-2" placeholder="Address line 1"
                v-model="currentProvider.Jurisdiction.AddressLine[0]"/>
            <label for="jurisdictionInputLine1">Address line 1</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="jurisdictionInputLine2" class="form-control my-2" placeholder="Address line 3"
                v-model="currentProvider.Jurisdiction.AddressLine[1]"/>
            <label for="jurisdictionInputLine2">Address line 2</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="jurisdictionInputLine3" class="form-control my-2" placeholder="Address line 3"
                v-model="currentProvider.Jurisdiction.AddressLine[2]"/>
            <label for="jurisdictionInputLine1">Address line 3</label>
          </div>
        </div>

        
        <label for="description">Address:</label>
          <div class="form-floating mb-1">
          <input type="text" id="floatingInputName" class="form-control my-2" placeholder="Name"
              v-model="currentProvider.Address.Name"/>
          <label for="floatingInputName">Name</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputLine1" class="form-control my-2" placeholder="Address line 1"
              v-model="currentProvider.Address.AddressLine[0]"/>
          <label for="floatingInputLine1">Address line 1</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputLine2" class="form-control my-2" placeholder="Address line 3"
              v-model="currentProvider.Address.AddressLine[1]"/>
          <label for="floatingInputLine2">Address line 2</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputLine3" class="form-control my-2" placeholder="Address line 3"
              v-model="currentProvider.Address.AddressLine[2]"/>
          <label for="floatingInputLine3">Address line 3</label>
        </div>

        <div class="form-group">
          <label for="description">Electronic Address:</label>
           <div class="form-floating mb-1">
          <input type="text" id="floatingInputTelephone" class="form-control my-2" placeholder="Telephone"
              v-model="currentProvider.ElectronicAddress.Telephone"/>
          <label for="floatingInputTelephone">Telephone</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="floatingInputFax" class="form-control my-2" placeholder="Fax"
                v-model="currentProvider.ElectronicAddress.Fax"/>
            <label for="floatingInputFax">Fax</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="floatingInputEmail" class="form-control my-2" placeholder="Email"
                v-model="currentProvider.ElectronicAddress.Email"/>
            <label for="floatingInputEmail">Email</label>
          </div>
          <div class="form-floating mb-1">
            <input type="text" id="floatingInputUrl" class="form-control my-2" placeholder="Url"
                v-model="currentProvider.ElectronicAddress.Url"/>
            <label for="floatingInputUrl">Url</label>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Regulator:</label><br>
          <div class="btn-group btn-group-sm my-2" role="group" aria-label="Basic radio toggle button group">
            <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" :checked="currentProvider.Regulator">
            <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
    
            <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio" :checked="!currentProvider.Regulator">
            <label class="btn btn-outline-primary" for="btnradioNo">No</label>
          </div>
        </div>
        


      </form>

    </div>

    <div class="col-sm-2">
      <div class="btn-group btn-group-sm my-2" role="group">
        <button class="btn btn-outline-danger"
          @click="confirmDelete = !confirmDelete"
        >
          Delete
        </button>

        <button type="submit" class="btn btn-outline-primary"
          @click="updateProvider"
          :disabled="sending"
        >
          Update
        </button>        
      </div>
      <p>{{ message }}</p>
    </div>    

  </div>

  <div v-else>
    <br />
    <p>Provider was not found...</p>
  </div>

  
  
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService";
import LoginService from "../../services/LoginService"
export default {
  name: "tutorial",
  data() {
    return {
      currentProvider: null,
      message: '',
      confirmDelete: false,
      sending: false,
    };
  },
  methods: {
    getProvider(id) {
      ProviderDataService.get(id)
        .then(response => {
          this.currentProvider = response.data;
          try {
            this.currentProvider.Address = JSON.parse(response.data.Address)
            if(!Object.prototype.hasOwnProperty.call(this.currentProvider.Address,"AddressLine")) {
              throw "Invalid address";
            }
          } catch {
            const oldData = this.currentProvider.Address;
            this.currentProvider.Address = {Name: "",AddressLine: ["","",""]};
            if(oldData.street) {
              this.currentProvider.Address.AddressLine[0] = oldData.street;
            }
            if(oldData.city && oldData.postcode) {
              this.currentProvider.Address.AddressLine[1] = oldData.city+ " "+ oldData.postcode;
            }
            if(oldData.country) {
              this.currentProvider.Address.AddressLine[2] = oldData.country;
            }
          }
          try {
            this.currentProvider.Jurisdiction = JSON.parse(response.data.Jurisdiction)
            if(!Object.prototype.hasOwnProperty.call(this.currentProvider.Jurisdiction,"AddressLine")) {
              throw "Invalid address";
            }
          } catch {
           this.currentProvider.Jurisdiction = {Name: "",AddressLine: [this.currentProvider.Jurisdiction,"",""]};
          }
          try {
            this.currentProvider.ElectronicAddress = JSON.parse(response.data.ElectronicAddress);
            if(!Object.prototype.hasOwnProperty.call(this.currentProvider.ElectronicAddress,"Email")) {
              throw "Invalid electronic address";
            }
          } catch(e) {
            console.log(e);
            this.currentProvider.ElectronicAddress = {Telephone: "",Fax: "",Email:this.currentProvider.ElectronicAddress,Url: ""};
          }
          try {
            this.currentProvider.ContactName = JSON.parse(response.data.ContactName);
            if(!Array.isArray(this.currentProvider.ContactName)) {
              throw "Invalid contact name";
            }
          } catch(e) {
            console.log(e);
            this.currentProvider.ContactName = [];
          }
          try {
            this.currentProvider.Icons = JSON.parse(response.data.Icons);
            if(!Array.isArray(this.currentProvider.Icons)) {
              throw "Invalid icons";
            }
          } catch(e) {
            console.log(e);
            this.currentProvider.Icons = [];
          }
          if(!this.currentProvider.Names) this.currentProvider.Names = []
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
          // TODO: move this handler the service module
          // error with fetch (unauthorized)
          // clear session data & re-login
          LoginService.reset()
        });
    },
    updateProvider() {
      const addrstring = JSON.stringify(this.currentProvider.Address)
      const jurisdictionstring = JSON.stringify(this.currentProvider.Jurisdiction)
      const electronicaddrstring = JSON.stringify(this.currentProvider.ElectronicAddress)
      const contactname = JSON.stringify(this.currentProvider.ContactName);
      const icons = JSON.stringify(this.currentProvider.Icons);


      const data = {
            ...this.currentProvider,
            Address: addrstring,
            ElectronicAddress: electronicaddrstring,
            Jurisdiction: jurisdictionstring,
            ContactName: contactname,
            Icons: icons
        }

      //console.log("POST",this.currentProvider.Id, data)
      this.sending = true
      ProviderDataService.update(this.currentProvider.Id, data) 
        .then(response => {
          console.log(response.data);
          this.message = 'The Provider was updated successfully!'
          setTimeout(() => {
            this.$router.push({ name: "providers" })
          }, 2000)
        })
        .catch(e => {
          this.sending = false
          console.log(e);
          this.message = "Could not update Provider."
        });
    },

    confirmDeleteProvider() {
      this.confirmDelete = !this.confirmDelete
    },

    deleteProvider() {
      this.sending = true
      this.confirmDelete = false
      ProviderDataService.delete(this.currentProvider.Id)
        .then(response => {
          console.log(response.data);
          this.message = 'The Provider was deleted successfully!'
          setTimeout(() => {
            this.$router.push({ name: "providers" })
          }, 2000)
        })
        .catch(e => {
          this.sending = false
          console.log(e);
          this.message = "Could not delete Provider."
        });
    },
    addContactField() {
      this.currentProvider.ContactName.push({name: "", type: "GivenName"})
    },
    delContactField(item) {
      if(this.currentProvider.ContactName.length == 1 || item.target.id != 0) {
        this.currentProvider.ContactName.splice(item.target.id, 1)
      }
    },
    addNameField() {
      this.currentProvider.Names.push({name: "", type: ""})
    },
    delNameField(item) {
      console.log(item.target.id)
      this.currentProvider.Names.splice(item.target.id, 1)
    },
    addIconField() {
      this.currentProvider.Icons.push({content: "", type: "MediaUri",  mimeType: ""})
    },
    delIconField(item) {
        this.currentProvider.Icons.splice(item.target.id, 1)
    },

    regulatorRadio(item) {
      if(item.target.id === "btnradioYes") {
        this.currentProvider.Regulator = 1
      } 
      else {
        this.currentProvider.Regulator = 0
      }
    },


  },  

  mounted() {
    this.message = '';
    this.getProvider(this.$route.params.id);
  }
};
</script>

<style scoped>
.edit-form {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
.test-form {
  background: rgb(39, 39, 39);
  border-radius: 0.5rem;
}
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}
</style>