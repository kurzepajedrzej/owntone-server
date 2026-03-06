<template>
  <content-with-heading>
    <template #heading>
      <pane-title :content="{ title: 'Source' }" />
    </template>
    <template #content>
      <!-- ── Source selector ─────────────────────────────────────── -->
      <div class="block">
        <p class="heading has-text-grey mb-2">Input source</p>
        <div class="buttons">
          <button
            v-for="src in SOURCES"
            :key="src.pipe"
            class="button is-large is-fullwidth mb-2"
            :class="activePipe === src.pipe ? 'is-primary' : 'is-light'"
            :disabled="loading"
            @click="playSource(src)"
          >
            <span class="icon">
              <mdicon :name="src.icon" size="28" />
            </span>
            <span class="is-size-5 has-text-weight-semibold ml-2">{{
              src.label
            }}</span>
            <span
              v-if="activePipe === src.pipe && playerStore.state === 'play'"
              class="tag is-success is-rounded ml-3"
            >
              playing
            </span>
          </button>
        </div>
      </div>

      <hr />

      <!-- ── AirPlay / output quick-select ───────────────────────── -->
      <div class="block">
        <p class="heading has-text-grey mb-2">Outputs</p>
        <control-main-volume />
        <control-output-volume
          v-for="output in outputsStore.outputs"
          :key="output.id"
          :output="output"
        />
        <p
          v-if="outputsStore.outputs.length === 0"
          class="has-text-grey-light is-size-7"
        >
          No outputs detected.
        </p>
      </div>
    </template>
  </content-with-heading>
</template>

<script>
import ContentWithHeading from '@/templates/ContentWithHeading.vue'
import ControlMainVolume from '@/components/ControlMainVolume.vue'
import ControlOutputVolume from '@/components/ControlOutputVolume.vue'
import PaneTitle from '@/components/PaneTitle.vue'
import queue from '@/api/queue'
import { useOutputsStore } from '@/stores/outputs'
import { usePlayerStore } from '@/stores/player'
import { useQueueStore } from '@/stores/queue'

// ── Configure your two pipe sources here ────────────────────────────────────
// The pipe files must exist on the server and be in the library directory.
// On your Dell Wyse 3040:
//   mkfifo /srv/music/cd.pipe    # jack input from CD player
//   mkfifo /srv/music/ipod.pipe  # Behringer UCA202 line-in
const SOURCES = [
  {
    icon: 'disc',
    label: 'CD',
    pipe: 'cd.pipe',
    path: '/srv/music/cd.pipe'
  },
  {
    icon: 'music-box-multiple',
    label: 'iPod',
    pipe: 'ipod.pipe',
    path: '/srv/music/ipod.pipe'
  }
]
// ────────────────────────────────────────────────────────────────────────────

export default {
  name: 'PageSource',
  components: {
    ContentWithHeading,
    ControlMainVolume,
    ControlOutputVolume,
    PaneTitle
  },

  setup() {
    return {
      SOURCES,
      outputsStore: useOutputsStore(),
      playerStore: usePlayerStore(),
      queueStore: useQueueStore()
    }
  },

  data() {
    return { loading: false }
  },

  computed: {
    // Returns the pipe filename of the currently playing source, or null
    activePipe() {
      const current = this.queueStore.current
      if (!current || current.data_kind !== 'pipe') return null
      // current.title is the filename without extension (e.g. "cd" for cd.pipe)
      const match = SOURCES.find(
        (s) => s.pipe.replace('.pipe', '') === current.title
      )
      return match ? match.pipe : null
    }
  },

  methods: {
    async playSource(src) {
      this.loading = true
      try {
        await queue.playExpression(
          `path is "${src.path}"`,
          false,
          0
        )
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
