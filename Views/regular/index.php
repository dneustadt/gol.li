<?php if (@$data['name']): ?>
    <?php if (@$data['is_owner']): ?>
        <h2>Hello <?= @$data['username']; ?>!</h2>
        <div class="row">
            <div class="column">
                <p>
                    You can manage your profile by adding services below and subsequently entering your corresponding user name or ID.<br>
                    Change the order of displayed services by clicking and dragging rows to the desired position.<br>
                    You can request a
                    <a href="<?= @$data['base_path']; ?>/<?= @$data['username'] . '?preview=1'; ?>" target="_blank">preview</a>
                    of your public profile while logged in.
                </p>
            </div>
        </div>
        <div class="tab-container">
            <input type="radio" name="tabs" id="services"<?php if (@empty($data['error'])): ?> checked="checked"<?php endif; ?>>
            <label for="services" class="tab-header">Services</label>
            <form action="<?= @$data['base_path']; ?>/<?= @$data['name']; ?>/update" method="post"
                  class="service-form tab">
                <div class="row" data-sticky-container="true">
                    <div class="column service-select">
                        <div class="service-select--dropdown" data-sticky="true">
                            <button type="button" class="dropdown-label">+ Add services</button>
                            <dl>
                                <?php foreach (@$data['services'] as $service): ?>
                                    <dt>
                                        <input type="checkbox" id="service-select--<?= $service['id']; ?>" value="<?= $service['id']; ?>"
                                            <?php if (!empty($service['handle'])): ?> checked="checked"<?php endif; ?>>
                                        <label for="service-select--<?= $service['id']; ?>">
                                            <span class="service-icon">
                                                <?php if (!empty($service['image'])): ?>
                                                    <img class="icon" src="<?= @$data['base_path']; ?><?= $service['image']; ?>" alt="<?= $service['name']; ?>">
                                                <?php endif; ?>
                                            </span>
                                            <span class="service-name"><?= $service['name']; ?></span>
                                        </label>
                                    </dt>
                                <?php endforeach; ?>
                            </dl>
                        </div>
                    </div>
                    <div class="column service-rows">
                        <?php foreach (@$data['services'] as $service): ?>
                            <div class="row service"<?php if (empty($service['handle'])): ?> style="display: none;"<?php endif; ?>>
                                <div class="column column-25">
                                    <span class="service-icon">
                                        <?php if (!empty($service['image'])): ?>
                                            <img class="icon" src="<?= @$data['base_path']; ?><?= $service['image']; ?>" alt="<?= $service['name']; ?>">
                                        <?php endif; ?>
                                    </span>
                                    <span class="service-name"><?= $service['name']; ?></span>
                                </div>
                                <div class="column url-pattern">
                                    <?= sprintf(
                                        $service['url'],
                                        '</div>' .
                                        '<div class="column handle">' .
                                        '<input type="text" data-id="' . $service['id'] . '" name="services[' . $service['id'] . ']" value="' . @$service['handle'] . '">' .
                                        '</div>' .
                                        '<div class="column url-pattern">'
                                    ); ?>
                                </div>
                                <div class="column remove">
                                    <button class="remove--button" type="button" data-id="<?= $service['id']; ?>">&times;</button>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <button type="submit" class="float-right">Save</button>
            </form>
            <input type="radio" name="tabs" id="share">
            <label class="tab-header" for="share">Share & Embedd</label>
            <div class="tab">
                <div class="row">
                    <div class="column">
                        <a href="#"
                           class="button create-qrcode"
                           data-js="<?= @$data['base_path']; ?>/web/js/dist/qrcode.min.js"
                           data-url="https://gol.li<?= @$data['base_path']; ?>/<?= @$data['name']; ?>">
                            Create QR Code for your profile
                        </a>
                    </div>
                    <div class="column">
                        <div id="qrcode"></div>
                    </div>
                </div>
                <div class="row">
                    <div class="column">
                        <p>Embedd a ready-made widget with links to all your profiles.</p>
                        <pre>
    <?= htmlentities('<iframe src="//gol.li'); ?><?= @$data['base_path']; ?>/<?= @$data['name']; ?><?= htmlentities('/share"
            style="width: 320px; 
                   height: 80px;
                   border: 1px solid #ccc;"></iframe>'); ?></pre>
                    </div>
                    <div class="column">
                        <p>Preview:</p>
                        <?php include __DIR__ . '/../_partials/iframe-demo.php'; ?>
                    </div>
                </div>
                <div class="row">
                    <div class="column">
                    <p>Add the json parameter to receive raw data as JSON.</p>
                    <pre>
    curl https://gol.li<?= @$data['base_path']; ?>/<?= @$data['name']; ?>/share?json=1</pre>
                    </div>
                    <div class="column">
                        <p>Response:</p>
                        <pre>
    {
        "Facebook": "https:\/\/facebook.com\/foo",
        "Instagram": "https:\/\/instagram.com\/bar",
        "YouTube": "https:\/\/youtube.com\/user\/foobar"
    }</pre>
                    </div>
                </div>
            </div>
            <input type="radio" name="tabs" id="profile"<?php if (@!empty($data['error'])): ?> checked="checked"<?php endif; ?>>
            <label for="profile" class="tab-header">Profile</label>
            <div class="tab">
                <div class="row">
                    <div class="column">
                        <fieldset class="profile-form">
                            <form action="<?= @$data['base_path']; ?>/<?= @$data['name']; ?>/updateProfile" method="post">
                                <div class="profile-form--field">
                                    <input placeholder="Old Password" type="password" id="old_password" name="_old_password" required>
                                </div>
                                <?php if (@$data['error'] == 'password'): ?>
                                    <ul class="errors">
                                        <li>The provided password is invalid</li>
                                    </ul>
                                <?php endif; ?>
                                <div class="profile-form--field">
                                    <input placeholder="New Password" type="password" id="new_password" name="_new_password">
                                </div>
                                <div class="profile-form--field">
                                    <input placeholder="Confirm New Password" type="password" id="new_password_confirm" name="_new_password_confirm">
                                </div>
                                <?php if (@$data['error'] == 'password_match'): ?>
                                    <ul class="errors">
                                        <li>The passwords didn't match or the new password is too short (min. 6 characters)</li>
                                    </ul>
                                <?php endif; ?>
                                <div class="profile-form--field">
                                    <input placeholder="Email" type="text" id="email" name="_email"
                                           <?php if (@$data['email']): ?> value="<?= @$data['email']; ?>"<?php endif; ?>>
                                </div>
                                <?php if (@$data['error'] == 'email'): ?>
                                    <ul class="errors">
                                        <li>The provided email address has already been registered</li>
                                    </ul>
                                <?php endif; ?>
                                <div class="profile-form--field">
                                    <button type="submit" class="float-right">Update</button>
                                </div>
                            </form>
                        </fieldset>
                    </div>
                    <div class="column">
                        <form action="<?= @$data['base_path']; ?>/<?= @$data['name']; ?>/deleteProfile" class="delete-form">
                            <label for="delete-confirm" class="float-right">Yes, I'm sure I want to delete my account and all associated data</label>
                            <input type="checkbox" id="delete-confirm" class="confirm-checkbox float-right">
                            <button type="submit" class="float-right" disabled="disabled">Delete Profile</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="column">
                <a href="<?= @$data['base_path']; ?>/logout" class="button">Logout</a>
            </div>
        </div>
    <?php else: ?>
        <h2 class="username">
            <?= @$data['name']; ?>
        </h2>
        <?php foreach (@$data['services'] as $service): ?>
            <div class="row service front">
                <div class="column column-25">
                    <span class="service-icon">
                        <?php if (!empty($service['image'])): ?>
                            <img class="icon" src="<?= @$data['base_path']; ?><?= $service['image']; ?>" alt="<?= $service['name']; ?>">
                        <?php endif; ?>
                    </span>
                    <span class="service-name"><?= $service['name']; ?></span>
                </div>
                <div class="column">
                    <a href="<?= sprintf($service['url'], $service['handle']); ?>" target="_blank">
                        <?= sprintf($service['url'], $service['handle']); ?>
                    </a>
                </div>
                <div class="column actions">
                    <a href="<?= sprintf($service['url'], $service['handle']); ?>" target="_blank">
                        <svg x="0px" y="0px" width="12px" height="12px">
                            <g>
                                <polygon id="box" style="fill-rule:evenodd;clip-rule:evenodd;" points="2,2 5,2 5,3 3,3 3,9 9,9 9,7 10,7 10,10 2,10"></polygon>
                                <polygon id="arrow_13_" style="fill-rule:evenodd;clip-rule:evenodd;" points="6.211,2 10,2 10,5.789 8.579,4.368 6.447,6.5
                                    5.5,5.553 7.632,3.421"></polygon>
                            </g>
                        </svg>
                    </a>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
<?php else: ?>
    <?php if (!@$data['is_loggedin']): ?>
        <div class="row">
            <div class="column advantages">
                <h2 class="logo">gol.li</h2>
                <h3 class="subline">the social network hub</h3>
                <blockquote>
                    <p><em>All of your social network profiles in one place.</em></p>
                </blockquote>
                <ul>
                    <li>All of the most important social networks included</li>
                    <li>Collect &amp; manage your profile pages</li>
                    <li>Get a short, memorable URL to your social network hub</li>
                    <li>Easily embedd a widget of your hub on your website, or...</li>
                    <li>...fetch the raw data as JSON for use in your own app</li>
                </ul>
                <a href="<?= @$data['base_path']; ?>/demo" class="button demo-link">Demo<br>Profile</a>
            </div>
            <div class="column">
                <?php include __DIR__ . '/../_partials/front-display.php'; ?>
            </div>
        </div>
        <div class="row">
            <div class="column">
                <fieldset class="login-form">
                    <legend>Login:</legend>
                    <form action="<?= @$data['base_path']; ?>/login" method="post">
                        <div class="login-form--field">
                            <input placeholder="Username" type="text" id="login-username" name="_username" required>
                        </div>
                        <div class="login-form--field">
                            <input placeholder="Password" type="password" id="login-password" name="_password" required>
                        </div>
                        <?php if (@$data['login_error'] == 'true'): ?>
                            <ul class="errors">
                                <li>The provided combination of password and username is invalid</li>
                            </ul>
                        <?php endif; ?>
                        <div class="login-form--field">
                            <button type="submit">Login</button>
                        </div>
                    </form>
                </fieldset>
            </div>
            <div class="column">
                <?php include __DIR__ . '/../register/index.php'; ?>
            </div>
        </div>
    <?php else: ?>
        <h2>Hello <?= @$data['username']; ?>!</h2>
        <p>
            You're logged in. Head over to your <a href="<?= @$data['base_path']; ?>/<?= @$data['username']; ?>">profile</a>
            and manage your social media profiles.
        </p>
        <a href="<?= @$data['base_path']; ?>/logout" class="button">Logout</a>
    <?php endif; ?>
<?php endif; ?>
