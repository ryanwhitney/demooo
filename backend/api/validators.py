import re

from django.core import validators
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _


@deconstructible
class AlphanumericUsernameValidator(validators.RegexValidator):
    """
    Validator that enforces usernames to be lowercase alphanumeric only.
    """

    regex = r"^[a-z0-9]+$"
    message = _(
        "Enter a valid username. This value may contain only lowercase letters "
        "and numbers."
    )
    flags = re.ASCII
