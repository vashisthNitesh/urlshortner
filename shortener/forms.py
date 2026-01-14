from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import CustomDomain, Link, Tag, UTMTemplate


class LinkForm(forms.ModelForm):
    tags = forms.CharField(required=False, help_text="Comma-separated tags")

    class Meta:
        model = Link
        fields = [
            "destination_url",
            "slug",
            "title",
            "starts_at",
            "expires_at",
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_term",
            "utm_content",
            "redirect_type",
        ]
        widgets = {
            "destination_url": forms.URLInput(
                attrs={"placeholder": "Destination URL", "class": "form-control"}
            ),
            "slug": forms.TextInput(attrs={"placeholder": "Custom slug", "class": "form-control"}),
            "title": forms.TextInput(attrs={"placeholder": "Title (optional)", "class": "form-control"}),
            "starts_at": forms.DateTimeInput(attrs={"type": "datetime-local", "class": "form-control"}),
            "expires_at": forms.DateTimeInput(attrs={"type": "datetime-local", "class": "form-control"}),
        }

    def __init__(self, *args, user=None, is_premium=False, **kwargs):
        self.user = user
        self.is_premium = is_premium
        super().__init__(*args, **kwargs)
        if user and is_premium:
            self.fields["custom_domain"] = forms.ModelChoiceField(
                queryset=CustomDomain.objects.filter(user=user, is_verified=True),
                required=False,
            )
            self.fields["utm_template"] = forms.ModelChoiceField(
                queryset=UTMTemplate.objects.filter(user=user),
                required=False,
            )
            self.fields["custom_domain"].widget.attrs.update({"class": "form-select"})
            self.fields["utm_template"].widget.attrs.update({"class": "form-select"})
        self.fields["slug"].required = False
        self.fields["redirect_type"].required = False
        self.fields["tags"].widget.attrs.update({"class": "form-control", "placeholder": "marketing, launch"})
        self.fields["redirect_type"].widget.attrs.update({"class": "form-select"})
        for field_name in ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]:
            self.fields[field_name].widget.attrs.update({"class": "form-control"})
        if self.instance.pk:
            self.fields["tags"].initial = ", ".join(self.instance.tags.values_list("name", flat=True))

    def clean_expires_at(self):
        expires_at = self.cleaned_data.get("expires_at")
        if expires_at and expires_at <= timezone.now():
            raise forms.ValidationError("Expiration must be in the future.")
        return expires_at

    def save(self, commit=True):
        instance = super().save(commit=False)
        if "custom_domain" in self.cleaned_data:
            instance.custom_domain = self.cleaned_data.get("custom_domain")
        template = self.cleaned_data.get("utm_template")
        if template:
            instance.utm_source = template.source
            instance.utm_medium = template.medium
            instance.utm_campaign = template.campaign
            instance.utm_term = template.term
            instance.utm_content = template.content
        tags_raw = self.cleaned_data.get("tags", "")
        if commit:
            instance.save()
            tags = [tag.strip() for tag in tags_raw.split(",") if tag.strip()]
            tag_ids = []
            for tag in tags:
                tag_obj, _ = Tag.objects.get_or_create(name=tag)
                tag_ids.append(tag_obj.id)
            instance.tags.set(tag_ids)
        return instance


class GuestLinkForm(forms.ModelForm):
    email = forms.EmailField()
    captcha = forms.IntegerField(help_text="What is 3 + 4?")

    class Meta:
        model = Link
        fields = ["destination_url", "slug"]
        widgets = {
            "destination_url": forms.URLInput(
                attrs={"placeholder": "Destination URL", "class": "form-control"}
            ),
            "slug": forms.TextInput(attrs={"placeholder": "Custom slug (optional)", "class": "form-control"}),
        }

    def clean_captcha(self):
        value = self.cleaned_data.get("captcha")
        if value != 7:
            raise forms.ValidationError("Incorrect captcha answer.")
        return value

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["slug"].required = False
        self.fields["email"].widget.attrs.update({"class": "form-control"})
        self.fields["captcha"].widget.attrs.update({"class": "form-control"})


class RegisterForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ("username", "email")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({"class": "form-control"})


class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs.update({"class": "form-control"})
