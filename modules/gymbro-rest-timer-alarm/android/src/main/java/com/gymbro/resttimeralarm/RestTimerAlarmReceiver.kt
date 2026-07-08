package com.gymbro.resttimeralarm

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

class RestTimerAlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != RestTimerAlarmConstants.ACTION_REST_TIMER_ALARM) {
      return
    }

    val title = intent.getStringExtra(RestTimerAlarmConstants.EXTRA_TITLE) ?: return
    val body = intent.getStringExtra(RestTimerAlarmConstants.EXTRA_BODY) ?: return
    val channelName = intent.getStringExtra(RestTimerAlarmConstants.EXTRA_CHANNEL_NAME) ?: title

    ensureNotificationChannel(context, channelName)
    showNotification(context, title, body)
  }

  private fun ensureNotificationChannel(context: Context, channelName: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val channel = NotificationChannel(
      RestTimerAlarmConstants.CHANNEL_ID,
      channelName,
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = channelName
      enableVibration(true)
      lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
      setSound(
        android.provider.Settings.System.DEFAULT_NOTIFICATION_URI,
        android.media.AudioAttributes.Builder()
          .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
          .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build(),
      )
      vibrationPattern = longArrayOf(0, 300, 200, 300)
    }

    val notificationManager =
      context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    notificationManager.createNotificationChannel(channel)
  }

  private fun showNotification(context: Context, title: String, body: String) {
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
      PackageManager.PERMISSION_GRANTED
    ) {
      return
    }

    val notification = NotificationCompat.Builder(context, RestTimerAlarmConstants.CHANNEL_ID)
      .setSmallIcon(context.applicationInfo.icon)
      .setContentTitle(title)
      .setContentText(body)
      .setAutoCancel(true)
      .setCategory(NotificationCompat.CATEGORY_REMINDER)
      .setContentIntent(createOpenAppPendingIntent(context))
      .setDefaults(NotificationCompat.DEFAULT_ALL)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .build()

    NotificationManagerCompat.from(context).notify(
      RestTimerAlarmConstants.NOTIFICATION_ID,
      notification,
    )
  }

  private fun createOpenAppPendingIntent(context: Context): PendingIntent? {
    val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
      ?.apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      }
      ?: return null

    return PendingIntent.getActivity(
      context,
      RestTimerAlarmConstants.REQUEST_CODE,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }
}
