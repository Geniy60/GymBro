package com.gymbro.resttimeralarm

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.os.Build
import android.os.CountDownTimer
import android.os.IBinder
import android.os.PowerManager
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat

class RestTimerForegroundService : Service() {
  private var countDownTimer: CountDownTimer? = null
  private var wakeLock: PowerManager.WakeLock? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == RestTimerAlarmConstants.ACTION_CANCEL_REST_TIMER_SERVICE) {
      stopTimer()
      return START_NOT_STICKY
    }

    startTimer(intent)
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    stopTimer()
    super.onDestroy()
  }

  private fun startTimer(intent: Intent?) {
    val startIntent = intent ?: return
    val seconds = startIntent
      .getIntExtra(RestTimerAlarmConstants.EXTRA_SECONDS, 1)
      .coerceAtLeast(1)
    val title = startIntent.getStringExtra(RestTimerAlarmConstants.EXTRA_TITLE) ?: return
    val body = startIntent.getStringExtra(RestTimerAlarmConstants.EXTRA_BODY) ?: return
    val channelName =
      startIntent.getStringExtra(RestTimerAlarmConstants.EXTRA_CHANNEL_NAME) ?: title
    val ongoingTitle =
      startIntent.getStringExtra(RestTimerAlarmConstants.EXTRA_ONGOING_TITLE) ?: channelName
    val ongoingBody =
      startIntent.getStringExtra(RestTimerAlarmConstants.EXTRA_ONGOING_BODY) ?: body

    countDownTimer?.cancel()
    releaseWakeLock()
    ensureNotificationChannels(channelName)

    startForeground(
      RestTimerAlarmConstants.ONGOING_NOTIFICATION_ID,
      buildOngoingNotification(ongoingTitle, ongoingBody),
    )
    acquireWakeLock(seconds)

    countDownTimer = object : CountDownTimer(seconds * 1000L, 1000L) {
      override fun onTick(millisUntilFinished: Long) = Unit

      override fun onFinish() {
        countDownTimer = null
        releaseWakeLock()
        stopForegroundCompat()
        showFinishedNotification(title, body)
        stopSelf()
      }
    }.start()
  }

  private fun stopTimer() {
    countDownTimer?.cancel()
    countDownTimer = null
    releaseWakeLock()
    stopForegroundCompat()
    stopSelf()
  }

  private fun acquireWakeLock(seconds: Int) {
    val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = powerManager
      .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "GymBro::RestTimer")
      .apply {
        setReferenceCounted(false)
        acquire(seconds * 1000L + 5000L)
      }
  }

  private fun releaseWakeLock() {
    val currentWakeLock = wakeLock
    wakeLock = null

    if (currentWakeLock?.isHeld == true) {
      currentWakeLock.release()
    }
  }

  private fun ensureNotificationChannels(channelName: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val notificationManager =
      getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val soundAttributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_NOTIFICATION)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

    val ongoingChannel = NotificationChannel(
      RestTimerAlarmConstants.ONGOING_CHANNEL_ID,
      channelName,
      NotificationManager.IMPORTANCE_LOW,
    ).apply {
      description = channelName
      setSound(null, null)
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
    }

    val finishedChannel = NotificationChannel(
      RestTimerAlarmConstants.FINISHED_CHANNEL_ID,
      channelName,
      NotificationManager.IMPORTANCE_HIGH,
    ).apply {
      description = channelName
      enableVibration(true)
      lockscreenVisibility = Notification.VISIBILITY_PUBLIC
      setSound(Settings.System.DEFAULT_NOTIFICATION_URI, soundAttributes)
      vibrationPattern = longArrayOf(0, 300, 200, 300)
    }

    notificationManager.createNotificationChannel(ongoingChannel)
    notificationManager.createNotificationChannel(finishedChannel)
  }

  private fun buildOngoingNotification(title: String, body: String): Notification {
    return NotificationCompat.Builder(this, RestTimerAlarmConstants.ONGOING_CHANNEL_ID)
      .setSmallIcon(applicationInfo.icon)
      .setContentTitle(title)
      .setContentText(body)
      .setCategory(NotificationCompat.CATEGORY_PROGRESS)
      .setContentIntent(createOpenAppPendingIntent())
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .build()
  }

  private fun showFinishedNotification(title: String, body: String) {
    if (
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
      PackageManager.PERMISSION_GRANTED
    ) {
      return
    }

    val notification = NotificationCompat.Builder(
      this,
      RestTimerAlarmConstants.FINISHED_CHANNEL_ID,
    )
      .setSmallIcon(applicationInfo.icon)
      .setContentTitle(title)
      .setContentText(body)
      .setAutoCancel(true)
      .setCategory(NotificationCompat.CATEGORY_REMINDER)
      .setContentIntent(createOpenAppPendingIntent())
      .setDefaults(NotificationCompat.DEFAULT_ALL)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .build()

    NotificationManagerCompat.from(this).notify(
      RestTimerAlarmConstants.NOTIFICATION_ID,
      notification,
    )
  }

  private fun createOpenAppPendingIntent(): PendingIntent? {
    val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
      ?.apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      }
      ?: return null

    return PendingIntent.getActivity(
      this,
      RestTimerAlarmConstants.REQUEST_CODE,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  private fun stopForegroundCompat() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      stopForeground(STOP_FOREGROUND_REMOVE)
      return
    }

    @Suppress("DEPRECATION")
    stopForeground(true)
  }
}
