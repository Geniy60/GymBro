package com.gymbro.resttimeralarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class RestTimerAlarmModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("GymbroRestTimerAlarm")

    AsyncFunction("scheduleRestTimerAlarmAsync") { seconds: Int, title: String, body: String, channelName: String, ongoingTitle: String, ongoingBody: String ->
      return@AsyncFunction startRestTimerService(
        seconds,
        title,
        body,
        channelName,
        ongoingTitle,
        ongoingBody,
      )
    }

    AsyncFunction("cancelRestTimerAlarmAsync") {
      cancelRestTimer()
    }

    AsyncFunction("canScheduleRestTimerAlarmAsync") {
      return@AsyncFunction canScheduleRestTimerAlarm()
    }

    AsyncFunction("openRestTimerAlarmSettingsAsync") {
      openRestTimerAlarmSettings()
    }
  }

  private fun startRestTimerService(
    seconds: Int,
    title: String,
    body: String,
    channelName: String,
    ongoingTitle: String,
    ongoingBody: String,
  ): Boolean {
    val intent = Intent(context, RestTimerForegroundService::class.java).apply {
      action = RestTimerAlarmConstants.ACTION_START_REST_TIMER_SERVICE
      putExtra(RestTimerAlarmConstants.EXTRA_SECONDS, seconds)
      putExtra(RestTimerAlarmConstants.EXTRA_TITLE, title)
      putExtra(RestTimerAlarmConstants.EXTRA_BODY, body)
      putExtra(RestTimerAlarmConstants.EXTRA_CHANNEL_NAME, channelName)
      putExtra(RestTimerAlarmConstants.EXTRA_ONGOING_TITLE, ongoingTitle)
      putExtra(RestTimerAlarmConstants.EXTRA_ONGOING_BODY, ongoingBody)
    }

    ContextCompat.startForegroundService(context, intent)
    return true
  }

  private fun cancelRestTimer() {
    cancelRestTimerAlarm()
    context.stopService(Intent(context, RestTimerForegroundService::class.java))
  }

  private fun canScheduleRestTimerAlarm(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return true
    }

    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    return alarmManager.canScheduleExactAlarms()
  }

  private fun scheduleRestTimerAlarm(
    seconds: Int,
    title: String,
    body: String,
    channelName: String,
  ): Boolean {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
      return false
    }

    val triggerAtMillis = System.currentTimeMillis() + seconds.coerceAtLeast(1) * 1000L
    val pendingIntent = createAlarmPendingIntent(title, body, channelName)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      alarmManager.setExactAndAllowWhileIdle(
        AlarmManager.RTC_WAKEUP,
        triggerAtMillis,
        pendingIntent,
      )
      return true
    }

    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
    return true
  }

  private fun cancelRestTimerAlarm() {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    alarmManager.cancel(createAlarmPendingIntent())
  }

  private fun openRestTimerAlarmSettings() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
      return
    }

    val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
      data = Uri.parse("package:${context.packageName}")
      flags = Intent.FLAG_ACTIVITY_NEW_TASK
    }

    context.startActivity(intent)
  }

  private fun createAlarmPendingIntent(
    title: String? = null,
    body: String? = null,
    channelName: String? = null,
  ): PendingIntent {
    val intent = Intent(context, RestTimerAlarmReceiver::class.java).apply {
      action = RestTimerAlarmConstants.ACTION_REST_TIMER_ALARM

      if (title != null && body != null && channelName != null) {
        putExtra(RestTimerAlarmConstants.EXTRA_TITLE, title)
        putExtra(RestTimerAlarmConstants.EXTRA_BODY, body)
        putExtra(RestTimerAlarmConstants.EXTRA_CHANNEL_NAME, channelName)
      }
    }

    return PendingIntent.getBroadcast(
      context,
      RestTimerAlarmConstants.REQUEST_CODE,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }
}
