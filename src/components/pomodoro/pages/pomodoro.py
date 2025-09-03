from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class Pomodoro:
    START_BTN = (By.CSS_SELECTOR, "[data-testid='start-btn']")
    PAUSE_BTN = (By.CSS_SELECTOR, "[data-testid='pause-btn']")
    RESET_BTN = (By.CSS_SELECTOR, "[data-testid='reset-btn']")
    TIMER_DISPLAY = (By.ID, "timeLeft")
    MODE_LABEL = (By.CSS_SELECTOR, "[data-testid='mode-label']")
    WORK_SLIDER = (By.ID, "workSlider")
    BREAK_SLIDER = (By.ID, "breakSlider")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)

    def open(self, url):
        self.driver.get(url)

    def click_start(self):
        btn = self.wait.until(
            EC.element_to_be_clickable(self.START_BTN)
        )
        btn.click()

    def click_pause(self):
        btn = self.wait.until(
            EC.element_to_be_clickable(self.PAUSE_BTN)
        )
        btn.click()

    def click_reset(self):
        btn = self.wait.until(
            EC.element_to_be_clickable(self.RESET_BTN)
        )
        btn.click()

    def get_timer_text(self):
        return self.driver.find_element(*self.TIMER_DISPLAY).text

    def get_mode_label_text(self):
        return self.driver.find_element(*self.MODE_LABEL).text.strip()

    def is_work_mode(self):
        """Check if currently in work mode"""
        return "Work Time" in self.get_mode_label_text()

    def is_break_mode(self):
        """Check if currently in break mode"""
        return "Break Time" in self.get_mode_label_text()

    def is_timer_active(self):
        """Check if timer is currently running"""
        start_btn = self.driver.find_element(*self.START_BTN)
        return start_btn.get_attribute("disabled") is not None

    def is_timer_paused(self):
        """Check if timer is paused"""
        pause_btn = self.driver.find_element(*self.PAUSE_BTN)
        return pause_btn.get_attribute("disabled") is not None

    def wait_for_mode_change(self, expected_mode, timeout=60):
        """Wait for the timer to change to a specific mode"""
        if expected_mode.lower() == "work":
            self.wait.until(lambda driver: "Work Time" in self.get_mode_label_text())
        elif expected_mode.lower() == "break":
            self.wait.until(lambda driver: "Break Time" in self.get_mode_label_text())

    def is_slider_disabled(self, slider_type):
        """Check if a specific slider is disabled"""
        if slider_type.lower() == "work":
            return self.driver.execute_script("""
                const slider = document.querySelector('#workSlider input');
                return slider ? slider.disabled : false;
            """)
        elif slider_type.lower() == "break":
            return self.driver.execute_script("""
                const slider = document.querySelector('#breakSlider input');
                return slider ? slider.disabled : false;
            """)
        return False
