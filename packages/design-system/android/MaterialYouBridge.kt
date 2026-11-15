package com.mesaviva.design

import android.content.Context
import android.os.Build
import org.json.JSONObject

/**
 * Puente Material You de Mesa Viva.
 *
 * Exporta las paletas tonales de Dynamic Colors (Android 12+) como JSON.
 * El cliente TypeScript lo consume con `parseAndroidDynamicColors(json)`.
 * No contiene secretos, red ni dependencias de AndroidX.
 */
object MaterialYouBridge {
    const val BRIDGE_VERSION: Int = 1
    const val MIN_API: Int = Build.VERSION_CODES.S

    private val TONES = intArrayOf(0, 10, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000)

    private val ACCENT_1 = intArrayOf(
        android.R.color.system_accent1_0,
        android.R.color.system_accent1_10,
        android.R.color.system_accent1_50,
        android.R.color.system_accent1_100,
        android.R.color.system_accent1_200,
        android.R.color.system_accent1_300,
        android.R.color.system_accent1_400,
        android.R.color.system_accent1_500,
        android.R.color.system_accent1_600,
        android.R.color.system_accent1_700,
        android.R.color.system_accent1_800,
        android.R.color.system_accent1_900,
        android.R.color.system_accent1_1000,
    )

    private val ACCENT_2 = intArrayOf(
        android.R.color.system_accent2_0,
        android.R.color.system_accent2_10,
        android.R.color.system_accent2_50,
        android.R.color.system_accent2_100,
        android.R.color.system_accent2_200,
        android.R.color.system_accent2_300,
        android.R.color.system_accent2_400,
        android.R.color.system_accent2_500,
        android.R.color.system_accent2_600,
        android.R.color.system_accent2_700,
        android.R.color.system_accent2_800,
        android.R.color.system_accent2_900,
        android.R.color.system_accent2_1000,
    )

    private val ACCENT_3 = intArrayOf(
        android.R.color.system_accent3_0,
        android.R.color.system_accent3_10,
        android.R.color.system_accent3_50,
        android.R.color.system_accent3_100,
        android.R.color.system_accent3_200,
        android.R.color.system_accent3_300,
        android.R.color.system_accent3_400,
        android.R.color.system_accent3_500,
        android.R.color.system_accent3_600,
        android.R.color.system_accent3_700,
        android.R.color.system_accent3_800,
        android.R.color.system_accent3_900,
        android.R.color.system_accent3_1000,
    )

    private val NEUTRAL_1 = intArrayOf(
        android.R.color.system_neutral1_0,
        android.R.color.system_neutral1_10,
        android.R.color.system_neutral1_50,
        android.R.color.system_neutral1_100,
        android.R.color.system_neutral1_200,
        android.R.color.system_neutral1_300,
        android.R.color.system_neutral1_400,
        android.R.color.system_neutral1_500,
        android.R.color.system_neutral1_600,
        android.R.color.system_neutral1_700,
        android.R.color.system_neutral1_800,
        android.R.color.system_neutral1_900,
        android.R.color.system_neutral1_1000,
    )

    private val NEUTRAL_2 = intArrayOf(
        android.R.color.system_neutral2_0,
        android.R.color.system_neutral2_10,
        android.R.color.system_neutral2_50,
        android.R.color.system_neutral2_100,
        android.R.color.system_neutral2_200,
        android.R.color.system_neutral2_300,
        android.R.color.system_neutral2_400,
        android.R.color.system_neutral2_500,
        android.R.color.system_neutral2_600,
        android.R.color.system_neutral2_700,
        android.R.color.system_neutral2_800,
        android.R.color.system_neutral2_900,
        android.R.color.system_neutral2_1000,
    )

    @JvmStatic
    fun isSupported(): Boolean = Build.VERSION.SDK_INT >= MIN_API

    /** Devuelve el JSON esperado por el sistema de diseño o null en Android antiguo. */
    @JvmStatic
    fun exportDynamicColors(context: Context): String? {
        if (!isSupported()) return null
        val root = JSONObject()
        root.put("accent1", palette(context, ACCENT_1))
        root.put("accent2", palette(context, ACCENT_2))
        root.put("accent3", palette(context, ACCENT_3))
        root.put("neutral1", palette(context, NEUTRAL_1))
        root.put("neutral2", palette(context, NEUTRAL_2))
        return root.toString()
    }

    private fun palette(context: Context, resources: IntArray): JSONObject {
        val palette = JSONObject()
        resources.forEachIndexed { index, resourceId ->
            val color = context.getColor(resourceId)
            palette.put(TONES[index].toString(), String.format("#%06X", 0xFFFFFF and color))
        }
        return palette
    }
}
