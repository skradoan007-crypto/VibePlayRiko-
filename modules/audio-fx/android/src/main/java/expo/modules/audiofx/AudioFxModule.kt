package expo.modules.audiofx

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.media.audiofx.PresetReverb
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Audio session 0 = global output mix. Effects attached here colour everything
// the app outputs through expo-av, without needing the player's session id.
private const val GLOBAL_SESSION = 0
private const val PRIORITY = 1000

class AudioFxModule : Module() {
  private var equalizer: Equalizer? = null
  private var bassBoost: BassBoost? = null
  private var reverb: PresetReverb? = null

  private fun ensure() {
    if (equalizer == null) {
      try {
        equalizer = Equalizer(PRIORITY, GLOBAL_SESSION)
      } catch (e: Throwable) {
        equalizer = null
      }
    }
    if (bassBoost == null) {
      try {
        bassBoost = BassBoost(PRIORITY, GLOBAL_SESSION)
      } catch (e: Throwable) {
        bassBoost = null
      }
    }
    if (reverb == null) {
      try {
        reverb = PresetReverb(PRIORITY, GLOBAL_SESSION)
      } catch (e: Throwable) {
        reverb = null
      }
    }
  }

  private fun releaseAll() {
    try { equalizer?.release() } catch (e: Throwable) {}
    try { bassBoost?.release() } catch (e: Throwable) {}
    try { reverb?.release() } catch (e: Throwable) {}
    equalizer = null
    bassBoost = null
    reverb = null
  }

  override fun definition() = ModuleDefinition {
    Name("AudioFx")

    Function("isAvailable") {
      true
    }

    Function("setEnabled") { enabled: Boolean ->
      ensure()
      try { equalizer?.enabled = enabled } catch (e: Throwable) {}
      try { bassBoost?.enabled = enabled } catch (e: Throwable) {}
      try { reverb?.enabled = enabled } catch (e: Throwable) {}
    }

    Function("getNumberOfBands") {
      ensure()
      (equalizer?.numberOfBands ?: 0).toInt()
    }

    Function("getCenterFrequencies") {
      ensure()
      val eq = equalizer ?: return@Function emptyList<Int>()
      val n = eq.numberOfBands.toInt()
      (0 until n).map { eq.getCenterFreq(it.toShort()) }
    }

    Function("getBandLevelRange") {
      ensure()
      val eq = equalizer ?: return@Function listOf(-1500, 1500)
      eq.bandLevelRange.map { it.toInt() }
    }

    Function("setBandLevels") { levels: List<Int> ->
      ensure()
      val eq = equalizer ?: return@Function
      val n = eq.numberOfBands.toInt()
      val count = if (levels.size < n) levels.size else n
      for (i in 0 until count) {
        try { eq.setBandLevel(i.toShort(), levels[i].toShort()) } catch (e: Throwable) {}
      }
    }

    Function("setBassBoost") { strength: Int ->
      ensure()
      val s = if (strength < 0) 0 else if (strength > 1000) 1000 else strength
      try { bassBoost?.setStrength(s.toShort()) } catch (e: Throwable) {}
    }

    Function("setReverbPreset") { preset: Int ->
      ensure()
      try { reverb?.preset = preset.toShort() } catch (e: Throwable) {}
    }

    Function("release") {
      releaseAll()
    }

    OnDestroy {
      releaseAll()
    }
  }
}
