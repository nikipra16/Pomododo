import pytest
from pages.pomodoro import Pomodoro
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException

def test_timer_start_pause_reset(driver):
    page = Pomodoro(driver)
    page.open("https://nikipra16.github.io/Pomododo/")

    # Wait for page to load
    time.sleep(2)
    
    # Test initial state
    initial_timer = page.get_timer_text()
    assert initial_timer == "25:00", "Initial timer should be 25:00"
    assert page.is_work_mode(), "Should start in work mode"
    assert not page.is_timer_active(), "Timer should not be active initially"

    # Test start functionality
    page.click_start()
    time.sleep(1)
    assert page.get_timer_text() != initial_timer, "Timer should start counting down"
    assert page.is_timer_active(), "Timer should be active after start"

    # Test pause functionality
    page.click_pause()
    paused_time = page.get_timer_text()
    time.sleep(1)
    assert page.get_timer_text() == paused_time, "Timer should stay paused"
    assert not page.is_timer_active(), "Timer should not be active after pause"

    # Test reset functionality
    page.click_reset()
    time.sleep(1)
    assert page.get_timer_text() == "25:00", "Timer should reset to 25:00"
    assert page.is_work_mode(), "Should be back in work mode after reset"
    assert not page.is_timer_active(), "Timer should not be active after reset"

def test_slider_disabled_states(driver):
    page = Pomodoro(driver)
    page.open("https://nikipra16.github.io/Pomododo/")
    time.sleep(2)

    # Test that sliders are enabled initially
    assert not page.is_slider_disabled("work"), "Work slider should be enabled initially"
    assert not page.is_slider_disabled("break"), "Break slider should be enabled initially"

    # Start timer and check sliders are disabled
    page.click_start()
    time.sleep(1)
    assert page.is_slider_disabled("work"), "Work slider should be disabled when timer is active"
    assert page.is_slider_disabled("break"), "Break slider should be disabled when timer is active"

    # Pause timer and check sliders are still disabled (business rule)
    page.click_pause()
    time.sleep(1)
    assert page.is_slider_disabled("work"), "Work slider should remain disabled when paused"
    assert page.is_slider_disabled("break"), "Break slider should remain disabled when paused"

    # Reset timer and check sliders are enabled again
    page.click_reset()
    time.sleep(1)
    assert not page.is_slider_disabled("work"), "Work slider should be enabled after reset"
    assert not page.is_slider_disabled("break"), "Break slider should be enabled after reset"

def test_initial_mode_state(driver):
    page = Pomodoro(driver)
    page.open("https://nikipra16.github.io/Pomododo/")
    time.sleep(2)

    # Test that the app starts in work mode
    assert page.is_work_mode(), "Should start in work mode initially"
    assert "Work Time" in page.get_mode_label_text(), "Label should show work time initially"
    
    # Test that mode label contains the expected text
    mode_text = page.get_mode_label_text()
    assert "Work Time" in mode_text, f"Mode label should contain 'Work Time', got: {mode_text}"

def test_button_states(driver):
    page = Pomodoro(driver)
    page.open("https://nikipra16.github.io/Pomododo/")
    time.sleep(2)

    # Initial state
    assert not page.is_timer_active(), "Timer should not be active initially"
    assert page.is_timer_paused(), "Timer should be paused initially"

    # After start
    page.click_start()
    time.sleep(1)
    assert page.is_timer_active(), "Timer should be active after start"
    assert not page.is_timer_paused(), "Timer should not be paused after start"

    # After pause
    page.click_pause()
    time.sleep(1)
    assert not page.is_timer_active(), "Timer should not be active after pause"
    assert page.is_timer_paused(), "Timer should be paused after pause"
