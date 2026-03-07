package com.squareup.cash.arcade

import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight

object Fonts {
  val CashSans = FontFamily(
    Font(
      resId = R.font.cashsans_black,
      weight = FontWeight.Black,
      style = FontStyle.Normal,
    ),
    Font(
      resId = R.font.cashsans_black_itl,
      weight = FontWeight.Black,
      style = FontStyle.Italic,
    ),
    Font(
      resId = R.font.cashsans_bold,
      weight = FontWeight.Bold,
      style = FontStyle.Normal,
    ),
    Font(
      resId = R.font.cashsans_bold_itl,
      weight = FontWeight.Bold,
      style = FontStyle.Italic,
    ),
    Font(
      resId = R.font.cashsans_extlight,
      weight = FontWeight.ExtraLight,
      style = FontStyle.Normal,
    ),
    Font(
      resId = R.font.cashsans_extlight_itl,
      weight = FontWeight.ExtraLight,
      style = FontStyle.Italic,
    ),
    Font(
      resId = R.font.cashsans_light,
      weight = FontWeight.Light,
      style = FontStyle.Normal,
    ),
    Font(
      resId = R.font.cashsans_light_itl,
      weight = FontWeight.Light,
      style = FontStyle.Italic,
    ),
    Font(
      resId = R.font.cashsans_medium,
      weight = FontWeight.Medium,
      style = FontStyle.Normal,
    ),
    Font(
      resId = R.font.cashsans_medium_itl,
      weight = FontWeight.Medium,
      style = FontStyle.Italic,
    ),
    Font(
      resId = R.font.cashsans_regular,
      weight = FontWeight.Normal,
      style = FontStyle.Normal,
    ),
    Font(
      resId = R.font.cashsans_regular_itl,
      weight = FontWeight.Normal,
      style = FontStyle.Italic,
    ),
    Font(
      resId = R.font.cashsans_semibold,
      weight = FontWeight.SemiBold,
      style = FontStyle.Normal,
    ),
    Font(
      resId = R.font.cashsans_semibold_itl,
      weight = FontWeight.SemiBold,
      style = FontStyle.Italic,
    ),
  )
  
  val CashSansMono = FontFamily(
    Font(
      resId = R.font.cashsansmono_regular,
      weight = FontWeight.Normal,
      style = FontStyle.Normal,
    ),
    Font(
      resId = R.font.cashsansmono_medium,
      weight = FontWeight.Medium,
      style = FontStyle.Normal,
    ),
  )
}
