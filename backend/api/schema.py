import graphene
import graphql_jwt
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required
from graphene_file_upload.scalars import Upload
from django.core.files.storage import default_storage

import os

# Import only your custom models
from .models import User, Profile, Track


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'tracks')


class ProfileType(DjangoObjectType):
    class Meta:
        model = Profile
        fields = ('id', 'user', 'bio', 'website', 'created_at', 'updated_at')


class TrackType(DjangoObjectType):
    class Meta:
        model = Track
        fields = ('id', 'user', 'title', 'description', 'tags', 'audio_file', 
                 'created_at', 'updated_at')
    
    audio_url = graphene.String()
    
    def resolve_audio_url(self, info):
        if self.audio_file:
            return self.audio_file.url
        return None


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    user = graphene.Field(UserType, username=graphene.String())
    users = graphene.List(UserType)

    # Track queries
    track = graphene.Field(TrackType, id=graphene.ID())
    tracks = graphene.List(TrackType)
    user_tracks = graphene.List(TrackType, username=graphene.String())

    @login_required
    def resolve_me(self, info):
        return info.context.user

    def resolve_user(self, info, username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    def resolve_users(self, info):
        return User.objects.all()

    def resolve_track(self, info, id):
        try:
            return Track.objects.get(pk=id)
        except Track.DoesNotExist:
            return None

    def resolve_tracks(self, info):
        return Track.objects.all()

    def resolve_user_tracks(self, info, username):
        try:
            user = User.objects.get(username=username)
            return Track.objects.filter(user=user)
        except User.DoesNotExist:
            return []


class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)
        first_name = graphene.String()
        last_name = graphene.String()

    def mutate(self, info, username, password, email, first_name=None, last_name=None):
        # Debug print to see what's being received
        print(f"Creating user with username: {username}, email: {email}")

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            raise Exception(f"User with username '{username}' already exists")

        if User.objects.filter(email=email).exists():
            raise Exception(f"User with email '{email}' already exists")

        # Create new user with all required fields
        user = User(
            username=username,
            email=email,
            first_name=first_name or "",
            last_name=last_name or "",
        )
        user.set_password(password)

        # Try/except to catch any errors during save
        try:
            user.save()
            print(f"User saved with id: {user.id}, username: {user.username}")
        except Exception as e:
            print(f"Error saving user: {str(e)}")
            raise Exception(f"Failed to create user: {str(e)}")

        return CreateUser(user=user)


class UpdateProfile(graphene.Mutation):
    profile = graphene.Field(ProfileType)

    class Arguments:
        bio = graphene.String()
        website = graphene.String()

    @login_required
    def mutate(self, info, bio=None, website=None):
        user = info.context.user
        profile = user.profile

        if bio is not None:
            profile.bio = bio
        if website is not None:
            profile.website = website

        profile.save()
        return UpdateProfile(profile=profile)


class UploadTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        title = graphene.String(required=True)
        description = graphene.String()
        file = Upload(required=True)

    @login_required
    @login_required
    def mutate(self, info, title, file, description=None):
        # Create track instance first
        track = Track(
            user=info.context.user,
            title=title,
            description=description or "",
        )
        # Save to get an ID
        track.save()

        # Get file extension
        _, ext = os.path.splitext(file.name)

        # Use user_id as artist folder and track_id as track folder
        artist_id = str(info.context.user.id)
        track_id = str(track.id)

        # Define path structure: audio/artist_id/track_id/track_id.ext
        filename = f"{track_id}{ext}"
        path = f'audio/{artist_id}/{track_id}/{filename}'

        # Check if file already exists at this path
        if default_storage.exists(path):
            # Clean up the track we just created
            track.delete()
            raise Exception(f"A file already exists at {path}")

        # Save the file
        file_path = default_storage.save(path, file)

        # Update track with file path
        track.audio_file = file_path
        track.save()

        return UploadTrack(track=track)


class UpdateTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        tags = graphene.String()

    @login_required
    def mutate(self, info, id, title=None, description=None, tags=None):
        try:
            track = Track.objects.get(pk=id)
        except Track.DoesNotExist:
            raise Exception("Track not found")

        # Check ownership
        if track.user != info.context.user:
            raise Exception("You do not have permission to update this track")

        if title is not None:
            track.title = title
        if description is not None:
            track.description = description
        if tags is not None:
            track.tags = tags

        track.save()
        return UpdateTrack(track=track)


class DeleteTrack(graphene.Mutation):
    success = graphene.Boolean()

    class Arguments:
        id = graphene.ID(required=True)

    @login_required
    def mutate(self, info, id):
        try:
            track = Track.objects.get(pk=id)
        except Track.DoesNotExist:
            raise Exception("Track not found")

        # Check ownership
        if track.user != info.context.user:
            raise Exception("You do not have permission to delete this track")

        # Delete the file from storage
        if track.audio_file:
            default_storage.delete(track.audio_file.name)

        # Delete the track record
        track.delete()

        return DeleteTrack(success=True)


class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    update_profile = UpdateProfile.Field()
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()

    # Track mutations
    upload_track = UploadTrack.Field()
    update_track = UpdateTrack.Field()
    delete_track = DeleteTrack.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
