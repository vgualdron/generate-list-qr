<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="#">Vgualdron QR</b-navbar-brand>
    </b-navbar>
    <b-card class="text-center">
      <b-tabs content-class="mt-3">
        <b-tab title="Generar lista de QR" active>
          <b-card class="text-center">
            <!-- <b-row class="mb-3">
              <b-col lg="12" class="my-1">
                <b-form-group
                  label=""
                  label-for="filter-input"
                  label-cols-sm="1"
                  label-align-sm="right"
                  label-size="sm"
                  class="mb-0"
                >
                  <b-input-group size="sm">
                    <b-form-input
                      id="filter-input"
                      v-model="filter"
                      type="search"
                      placeholder="Escriba el texto a buscar"
                    ></b-form-input>

                    <b-input-group-append>
                      <b-button :disabled="!filter" @click="filter = ''">Limpiar</b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
            </b-row> -->
            <!--<b-button @click="actionAdd" class="text-right mb-3 mt-3">Agregar fila</b-button>-->
            <!--<b-button v-if="showBtnGenerateQr" @click="showModal" class="text-right mb-3 mt-3 mr-2">Generar códigos QR</b-button>-->
            <b-table
              striped
              hover
              responsive
              :items="items"
              :fields="fields"
              :filter="filter"
              :filter-included-fields="filterOn"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              :sort-direction="sortDirection"
              stacked="md"
              show-empty
              small
              @filtered="onFiltered"
              class="mt-10">
              <template #cell(reference)="row">
                <b-form-input
                  v-model="row.item.reference"
                  type="text"
                ></b-form-input>
              </template>
              <template #cell(name)="row">
                <b-form-input
                  v-model="row.item.name"
                  type="text"
                ></b-form-input>
              </template>

              <template #cell(actions)="row">
                <b-button size="sm" @click="actionRemove(row.item, row.index, $event.target)">
                  Eliminar
                </b-button>
              </template>
            </b-table>
            <b-button @click="actionAdd" class="text-left mt-3">Agregar fila</b-button>
            <b-button v-if="showBtnGenerateQr" @click="showModal" class="text-right mt-3 mr-2">Generar códigos QR</b-button>
          </b-card>
          <b-modal
            v-model="modalShow"
            :title="modalTitle"
            @cancel="closeModal"
            @ok="generateQr"
            ref="modalQR"
          >
            <b-row v-for="(item, index) in items" :key="index">
              <b-col v-if="item.reference && item.name" lg="12" class="my-1 text-center">
                <b-card :title="item.name" :sub-title="item.reference">
                  <vue-qrcode :value="item.reference" :width="300" />
                </b-card>
              </b-col>
            </b-row>
          </b-modal>
        </b-tab>
        <b-tab title="Escanear QR" @click="reload">
          <b-card class="text-center">
            <b-row class="mb-10">
              <b-col lg="12" class="my-1">
                <p v-if="torchNotSupported" class="error">
                  Flash no soportado por la camara activa
                </p>
                <b-button @click="reload" class="text-right mb-3 mt-3">Recargar</b-button>
                <qrcode-stream :key="_uid" :track="paintCenterText" @init="onInit" v-if="!destroyed">
                  <button @click="torchActive = !torchActive" :disabled="torchNotSupported">
                    <img :src="icon" alt="toggle torch">
                  </button>
                  <div class="loading-indicator" v-if="loading">
                    Cargando...
                  </div>
                </qrcode-stream>
              </b-col>
            </b-row>
          </b-card>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>
<script>
import VueQrcode from 'vue-qrcode'
// import jsPDF from 'jspdf'
import { QrcodeStream } from 'vue-qrcode-reader'
export default {
  components: {
    VueQrcode,
    QrcodeStream
  },
  data () {
    return {
      torchActive: false,
      torchNotSupported: false,
      loading: false,
      destroyed: false,
      totalRows: 1,
      sortBy: '',
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      filterOn: [],
      modalTitle: 'Imprimir códigos QR',
      action: '',
      modalShow: false,
      responsive: true,
      fields: [
        {
          key: 'reference',
          label: 'Referencia',
          sortable: true
        },
        {
          key: 'name',
          label: 'Nombre',
          sortable: true
        },
        {
          key: 'actions',
          label: 'Acciones'
        }
      ],
      items: [
        {
          reference: '',
          name: ''
        }
      ]
    }
  },
  watch: {
  },
  computed: {
    icon () {
      if (this.torchActive) {
        return './images/flash-off.svg'
      } else {
        return './images/flash-on.svg'
      }
    },
    sortOptions () {
      // Create an options list from our fields
      return this.fields.filter(f => f.sortable).map((f) => {
        return { text: f.label, value: f.key }
      })
    },
    showBtnGenerateQr () {
      const rows = this.items.find((item) => {
        return item.reference.trim() && item.name.trim()
      })
      return rows
    }
  },
  mounted () {
    // Set the initial number of items
    this.totalRows = this.items.length
  },
  methods: {
    async onInit (promise) {
      this.loading = true
      try {
        const { capabilities } = await promise
        this.torchNotSupported = !capabilities.torch
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async reload () {
      this.destroyed = true
      await this.$nextTick()
      this.destroyed = false
    },
    logErrors (promise) {
      promise.catch(console.error)
    },
    paintCenterText (detectedCodes, ctx) {
      for (const detectedCode of detectedCodes) {
        const { boundingBox, rawValue } = detectedCode

        const centerX = boundingBox.x + boundingBox.width / 2
        const centerY = boundingBox.y + boundingBox.height / 2

        const fontSize = Math.max(12, 50 * boundingBox.width / ctx.canvas.width)

        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'

        ctx.lineWidth = 3
        ctx.strokeStyle = '#35495e'
        ctx.strokeText(detectedCode.rawValue, centerX, centerY)

        ctx.fillStyle = '#5cb984'
        ctx.fillText(rawValue, centerX, centerY)

        const [firstPoint, ...otherPoints] = detectedCode.cornerPoints

        ctx.strokeStyle = 'red'

        ctx.beginPath()
        ctx.moveTo(firstPoint.x, firstPoint.y)
        for (const { x, y } of otherPoints) {
          ctx.lineTo(x, y)
        }
        ctx.lineTo(firstPoint.x, firstPoint.y)
        ctx.closePath()
        ctx.stroke()
      }
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    showModal () {
      this.modalShow = true
    },
    hideModal () {
      this.modalShow = false
    },
    createObject () {
      return {
        id: '',
        reference: '',
        name: '',
        price: '',
        quantity: ''
      }
    },
    actionAdd () {
      this.items.push(this.createObject())
    },
    actionRemove (item, index, target) {
      this.items.splice(index, 1)
    },
    closeModal () {
      this.hideModal()
    },
    generateQr () {
      /* const doc = new jsPDF('p', 'pt', 'A4')
      const margins = {
        top: 80,
        bottom: 60,
        left: 40,
        width: 522
      }
      doc.fromHTML(this.$refs.modalQR.innerHTML, margins.left, margins.top, {
        width: margins.width
      })
      doc.save('test.pdf') */
    }
  }
}
</script>
<style scoped>
  .float-right {
    float: right;
    margin-bottom: 10px;
  }
</style>
