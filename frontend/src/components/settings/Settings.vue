<template>
  <div class="list row">
    <div class="col-md-8" v-if="this.provider">
      <h4>CSR Provider Information</h4>
      <h5>CSR Document language</h5>
      <div class="my-2">
        <label for="languagesDataList" class="form-label">Language:</label>
        <div class="btn-group">
          <span v-if="provider.Language && provider.Language in languages" class="btn btn-outline-primary mx-1 my-1">{{
            languages[provider.Language].name
          }}</span>
          <span v-else class="btn btn-outline-primary mx-1 my-1">{{ provider.Language }}</span>
        </div>
        <div class="btn-group">
          <input
            class="form-control"
            list="datalistOptionsLanguages"
            size="20"
            id="languagesDataList"
            placeholder="Type to search..."
            v-on:change="addLang"
            v-on:click="addLang"
          />
          <datalist id="datalistOptionsLanguages">
            <option v-for="(item, index) in languages" v-bind:key="index" v-bind:value="index">
              {{ item.name }}
            </option>
          </datalist>
        </div>
      </div>
      <h5>CSR Provider Organization</h5>
      <form>
        <div class="form-group">
          <label>Organization Names:</label>
          <button class="btn btn-outline-primary mx-2 mb-1" type="button" @click="addNameField">
            +
          </button>
          <div class="input-group mb-3">
            <div class="col-sm-12 px-0" v-for="(name, index) in provider.Names" :key="index">
              <div class="row my-0 mx-0">
                <div class="form-floating px-0 col-sm-5">
                  <input
                    type="text"
                    id="floatingInput"
                    class="form-control mb-1"
                    placeholder="Name"
                    v-model="name.name"
                  />
                  <label for="floatingInput">Name</label>
                </div>

                <div class="form-floating px-0 col-sm-5">
                  <select id="floatingInput2" v-model="name.type" class="form-control mx-2 mb-1">
                    <option value="">None</option>
                    <option value="main">Main</option>
                    <option value="variant">Variant</option>
                    <option value="former">Former</option>
                  </select>
                  <label for="floatingInput2">Type</label>
                </div>

                <button
                  class="btn btn-outline-danger mx-3 mb-1 col-sm-1"
                  type="button"
                  :id="index"
                  :disabled="provider.Names.length <= 1"
                  @click="delNameField"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Organization Icons:</label>
          <button class="btn btn-outline-primary mx-2 mb-1" type="button" @click="addIconField">+</button>
          <div class="input-group mb-3">
            <div class="col-sm-12 px-0" v-for="(icon, index) in provider.Icons" :key="index">
              <div class="row my-0 mx-0">
                <div class="form-floating px-0 col-sm-5">
                  <input
                    type="text"
                    id="floatingInput"
                    class="form-control mb-1"
                    placeholder="Name"
                    v-model="icon.content"
                  />
                  <label for="floatingInput">Content</label>
                </div>

                <div class="form-floating px-0 col-sm-2">
                  <select id="floatingInput5" v-model="icon.type" class="form-control mx-2 mb-1">
                    <option value="MediaUri">MediaURI</option>
                    <option value="MediaData16">hexBinary</option>
                    <option value="MediaData64">base64Binary</option>
                  </select>
                  <label for="floatingInpu5">Type</label>
                </div>

                <div class="form-floating px-0 col-sm-2 mx-3 mb-1" v-if="icon.type !== 'MediaUri'">
                  <input
                    type="text"
                    id="floatingInput"
                    class="form-control mb-1"
                    placeholder="mimeType"
                    v-model="icon.mimeType"
                  />
                  <label for="floatingInput">mimeType</label>
                </div>

                <button
                  class="btn btn-outline-danger mx-3 mb-1 col-sm-1"
                  type="button"
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
          <button class="btn btn-outline-primary mx-2 mb-1" type="button" @click="addKindNameField">
            Add Name
          </button>
          <button class="btn btn-outline-primary mx-2 mb-1" type="button" @click="addKindDefinitionField">
            Add Definition
          </button>
          <div class="input-group mb-3">
            <div class="col-sm-12 px-0" v-for="(kind, index) in provider.Kind" :key="index">
              <div class="row my-0 mx-0">
                <div v-if="kind.name != undefined" class="form-floating px-0 col-sm-5">
                  <input
                    type="text"
                    id="floatingInput"
                    class="form-control mb-1"
                    placeholder="Name"
                    v-model="kind.name"
                  />
                  <label for="floatingInput">Name</label>
                </div>
                <div v-if="kind.definition != undefined" class="form-floating px-0 col-sm-5">
                  <input
                    type="text"
                    id="floatingInput"
                    class="form-control mb-1"
                    placeholder="Definition"
                    v-model="kind.definition"
                  />
                  <label for="floatingInput">Definition</label>
                </div>

                <div class="form-floating px-0 col-sm-5">
                  <input
                    class="form-control"
                    list="datalistOptionsLanguages"
                    size="5"
                    id="languagesDataList"
                    placeholder="Type to search..."
                    v-model="kind.lang"
                  />
                  <label for="floatingInput2">Language</label>
                  <datalist id="datalistOptionsLanguages">
                    <option v-for="(item, index) in languages" v-bind:key="index" v-bind:value="index">
                      {{ item.name }}
                    </option>
                  </datalist>
                </div>

                <button
                  class="btn btn-outline-danger mx-3 mb-1 col-sm-1"
                  type="button"
                  :id="index"
                  @click="delKindField"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Contact name:</label>
          <button class="btn btn-outline-primary mx-2 mb-1" type="button" @click="addContactField">+</button>
          <div class="input-group mb-3">
            <div class="col-sm-12 px-0" v-for="(name, index) in provider.ContactName" :key="index">
              <div class="row my-0 mx-0">
                <div class="form-floating px-0 col-sm-5">
                  <input
                    type="text"
                    id="floatingInput"
                    class="form-control mb-1"
                    placeholder="Name"
                    v-model="name.name"
                  />
                  <label for="floatingInput">Name</label>
                </div>

                <div class="form-floating px-0 col-sm-5">
                  <select :disabled="index == 0" if="floatingInput3" v-model="name.type" class="form-control mx-2 mb-1">
                    <option value="GivenName">Given Name</option>
                    <option value="LinkingName">Linking Name</option>
                    <option value="FamilyName">Family Name</option>
                    <option value="Title">Title</option>
                    <option value="Salutation">Salutation</option>
                    <option value="Numeration">Numeration</option>
                  </select>
                  <label for="floatingInput3">Type</label>
                </div>

                <button
                  class="btn btn-outline-danger mx-3 mb-1 col-sm-1"
                  type="button"
                  :id="index"
                  :disabled="provider.ContactName.length < 1 && index == 0"
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
            <input
              type="text"
              id="jurisdictionInputName"
              class="form-control my-2"
              placeholder="Name"
              v-model="provider.Jurisdiction.Name"
            />
            <label for="jurisdictionInputName">Name</label>
          </div>
          <div class="form-floating mb-1">
            <input
              type="text"
              id="jurisdictionInputLine1"
              class="form-control my-2"
              placeholder="Address line 1"
              v-model="provider.Jurisdiction.AddressLine[0]"
            />
            <label for="jurisdictionInputLine1">Address line 1</label>
          </div>
          <div class="form-floating mb-1">
            <input
              type="text"
              id="jurisdictionInputLine2"
              class="form-control my-2"
              placeholder="Address line 3"
              v-model="provider.Jurisdiction.AddressLine[1]"
            />
            <label for="jurisdictionInputLine2">Address line 2</label>
          </div>
          <div class="form-floating mb-1">
            <input
              type="text"
              id="jurisdictionInputLine3"
              class="form-control my-2"
              placeholder="Address line 3"
              v-model="provider.Jurisdiction.AddressLine[2]"
            />
            <label for="jurisdictionInputLine1">Address line 3</label>
          </div>
        </div>

        <label for="description">Address:</label>
        <div class="form-floating mb-1">
          <input
            type="text"
            id="floatingInputStreet"
            class="form-control my-2"
            placeholder="Name"
            v-model="provider.Address.Name"
          />
          <label for="floatingInputStreet">Name</label>
        </div>
        <div class="form-floating mb-1">
          <input
            type="text"
            id="floatingInputCity"
            class="form-control my-2"
            placeholder="Addres line 1"
            v-model="provider.Address.AddressLine[0]"
          />
          <label for="floatingInputCity">Addres line 1</label>
        </div>
        <div class="form-floating mb-1">
          <input
            type="text"
            id="floatingInputCity"
            class="form-control my-2"
            placeholder="Addres line 3"
            v-model="provider.Address.AddressLine[1]"
          />
          <label for="floatingInputCity">Addres line 2</label>
        </div>
        <div class="form-floating mb-1">
          <input
            type="text"
            id="floatingInputCity"
            class="form-control my-2"
            placeholder="Addres line 3"
            v-model="provider.Address.AddressLine[2]"
          />
          <label for="floatingInputCity">Addres line 3</label>
        </div>

        <div class="form-group">
          <label for="description">Electronic Address:</label>
          <div class="form-floating mb-1">
            <input
              type="text"
              id="floatingInputTelephone"
              class="form-control my-2"
              placeholder="Telephone"
              v-model="provider.ElectronicAddress.Telephone"
            />
            <label for="floatingInputStreet">Telephone</label>
          </div>
          <div class="form-floating mb-1">
            <input
              type="text"
              id="floatingInputFax"
              class="form-control my-2"
              placeholder="Fax"
              v-model="provider.ElectronicAddress.Fax"
            />
            <label for="floatingInputCity">Fax</label>
          </div>
          <div class="form-floating mb-1">
            <input
              type="text"
              id="floatingInputEmail"
              class="form-control my-2"
              placeholder="Email"
              v-model="provider.ElectronicAddress.Email"
            />
            <label for="floatingInputPC">Email</label>
          </div>
          <div class="form-floating mb-1">
            <input
              type="text"
              id="floatingInputUrl"
              class="form-control my-2"
              placeholder="Url"
              v-model="provider.ElectronicAddress.Url"
            />
            <label for="floatingInputCountry">Url</label>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Regulator:</label><br />
          <div class="btn-group btn-group-sm my-2" role="group" aria-label="Basic radio toggle button group">
            <input
              type="radio"
              class="btn-check"
              name="btnradio"
              id="btnradioYes"
              autocomplete="off"
              @change="regulatorRadio"
              :checked="provider.Regulator"
            />
            <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>

            <input
              type="radio"
              class="btn-check"
              name="btnradio"
              id="btnradioNo"
              autocomplete="off"
              @change="regulatorRadio"
              :checked="!provider.Regulator"
            />
            <label class="btn btn-outline-primary" for="btnradioNo">No</label>
          </div>
        </div>
      </form>
    </div>
    <div class="col-md-4">
      <div class="btn-group btn-group-sm my-2" role="group">
        <button class="btn btn-outline-primary" type="button" @click="updateProvider">Save</button>
      </div>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
  import ListProviderDataService from "../../services/ListProviderDataService";
  import languages from "../../../../common/languages";

  export default {
    name: "settings-view",
    data() {
      return {
        lists: [],
        currentList: null,
        currentIndex: -1,
        listHistory: [],
        providerList: [],
        provider: null,
        languages: null,
        message: "",
      };
    },
    methods: {
      addNameField() {
        this.provider.Names.push({ name: "", type: "" });
      },
      delNameField(item) {
        if (this.provider.Names.length > 1) {
          this.provider.Names.splice(item.target.id, 1);
        }
      },
      addContactField() {
        this.provider.ContactName.push({ name: "", type: "GivenName" });
      },
      delContactField(item) {
        if (this.provider.ContactName.length == 1 || item.target.id != 0) {
          this.provider.ContactName.splice(item.target.id, 1);
        }
      },
      addIconField() {
        this.provider.Icons.push({ content: "", type: "MediaUri", mimeType: "" });
      },
      delIconField(item) {
        this.provider.Icons.splice(item.target.id, 1);
      },
      addKindNameField() {
        this.provider.Kind.push({ name: "", lang: "" });
      },
      addKindDefinitionField() {
        this.provider.Kind.push({ definition: "", lang: "" });
      },
      delKindField(item) {
        this.provider.Kind.splice(item.target.id, 1);
      },
      fetchListprovider() {
        ListProviderDataService.get()
          .then((response) => {
            if (response.data) {
              this.provider = response.data;
              if (!Array.isArray(this.provider.Kind)) {
                this.provider.Kind = [];
              }
              if (!Array.isArray(this.provider.Icons)) {
                this.provider.Icons = [];
              }
              if (!Array.isArray(this.provider.ContactName)) {
                this.provider.ContactName = [];
              }
              if (!Array.isArray(this.provider.Names)) {
                this.provider.Names = [];
              }
              if (!this.validateAddress(this.provider.Address)) {
                this.provider.Address = { Name: "", AddressLine: ["", "", ""] };
              }
              if (!this.validateAddress(this.provider.Jurisdiction)) {
                this.provider.Jurisdiction = { Name: "", AddressLine: ["", "", ""] };
              }
              if (!this.validateElectronicAddress(this.provider.ElectronicAddress)) {
                this.provider.ElectronicAddress = { Telephone: "", Fax: "", Email: "", Url: "" };
              }

              console.log(this.provider);
            }
          })
          .catch((e) => {
            console.log("lists", e);
          });
      },
      validateAddress(address) {
        if (!address) {
          return false;
        }
        if (address.Name == null) {
          return false;
        }
        if (address.AddressLine == null || !Array.isArray(address.AddressLine) || address.AddressLine.length < 3) {
          return false;
        }
        return true;
      },
      validateElectronicAddress(address) {
        if (!address) {
          return false;
        }
        if (address.Telephone == null || address.Fax == null || address.Email == null || address.Url == null) {
          return false;
        }
        return true;
      },
      updateProvider() {
        const addrstring = JSON.stringify(this.provider.Address);
        const jurisdictionstring = JSON.stringify(this.provider.Jurisdiction);
        const electronicaddrstring = JSON.stringify(this.provider.ElectronicAddress);
        const contactname = JSON.stringify(this.provider.ContactName);
        const icons = JSON.stringify(this.provider.Icons);
        const kind = JSON.stringify(this.provider.Kind);

        const data = {
          ...this.provider,
          Address: addrstring,
          Jurisdiction: jurisdictionstring,
          ElectronicAddress: electronicaddrstring,
          ContactName: contactname,
          Icons: icons,
          Kind: kind,
        };

        //console.log("POST",this.currentProvider.Id, data)
        ListProviderDataService.update(data)
          .then((response) => {
            console.log(response.data);
            this.message = "The Provider was updated successfully!";
          })
          .catch((error) => {
            console.log(error);
            if (error.response.data.message) {
              this.message = error.response.data.message; // => the response payload
            } else {
              this.message = "Could not update Provider.";
            }
          });
      },
      addLang(item) {
        //console.log(item.target.value)
        const value = item.target ? item.target.value : item;
        if (value.length === 2) {
          const valid = languages[value] !== undefined;

          if (valid) {
            this.provider.Language = value;
          } else {
            console.log("not valid", value);
          }
        }
        if (item.target) item.target.value = null;
      },
      removeLang(item) {
        this.SelectedLanguages.splice(item.target.id, 1);
      },
      regulatorRadio(item) {
        if (item.target.id === "btnradioYes") {
          this.provider.Regulator = 1;
        } else {
          this.provider.Regulator = 0;
        }
      },
    },
    mounted() {
      this.fetchListprovider();
      this.languages = languages;
      this.provider = {
        Kind: [],
        Icons: [],
        Name: "",
        Type: "",
        Names: [{ name: "", type: "" }],
        ContactName: [],
        Jurisdiction: {
          Name: "",
          AddressLine: ["", "", ""],
        },
        Address: {
          Name: "",
          AddressLine: ["", "", ""],
        },
        ElectronicAddress: { Telephone: "", Fax: "", Email: "", Url: "" },
        Regulator: 0,
      };
    },
  };
</script>

<style scoped>
  .historyList {
    max-height: 45vh;
    overflow-y: scroll;
  }
</style>
